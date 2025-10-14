import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import sizeOf from 'image-size';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const docxFile = formData.get('docx');

        if (!docxFile || docxFile.size === 0) {
            return NextResponse.json(
                { error: 'No DOCX file provided' },
                { status: 400 }
            );
        }

        const arrayBuffer = await docxFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const extractedImages = [];
        let imageIndex = 0;

        // Enhanced context-aware sizing function
        const getOptimalImageSize = (originalWidth, originalHeight, imageBuffer) => {
            const aspectRatio = originalWidth / originalHeight;
            const imageArea = originalWidth * originalHeight;

            // Detect likely mathematical content
            const isLikelyMath = (aspectRatio > 2 && originalHeight < 50) ||
                (imageArea < 5000 && originalWidth < 200) ||
                (aspectRatio > 1.5 && originalHeight < 80);

            // Detect charts/graphs (usually wider with moderate height)
            const isLikelyChart = aspectRatio > 2.5 && originalWidth > 200;

            // Detect small symbols/icons
            const isSmallSymbol = imageArea < 2000 && originalWidth < 100 && originalHeight < 100;

            let maxWidth, maxHeight, category;

            if (isSmallSymbol) {
                // Small symbols - keep original size or slightly larger
                maxWidth = Math.min(originalWidth * 1.1, 60);
                maxHeight = Math.min(originalHeight * 1.1, 60);
                category = 'symbol';
            } else if (isLikelyMath) {
                // Mathematical formulas - preserve detail, moderate sizing
                maxWidth = Math.min(originalWidth * 1.3, 250);
                maxHeight = Math.min(originalHeight * 1.3, 80);
                category = 'math';
            } else if (isLikelyChart) {
                // Charts/graphs - allow wider display
                maxWidth = Math.min(originalWidth, 400);
                maxHeight = Math.min(originalHeight, 200);
                category = 'chart';
            } else {
                // Regular images
                maxWidth = Math.min(originalWidth, 200);
                maxHeight = Math.min(originalHeight, 200);
                category = 'regular';
            }

            return { maxWidth, maxHeight, category };
        };

        const options = {
            convertImage: mammoth.images.imgElement(async function(image) {
                try {
                    const imageBuffer = await image.readAsBuffer();
                    const dimensions = sizeOf(imageBuffer);
                    const { width: originalWidth, height: originalHeight } = dimensions;

                    const { maxWidth, maxHeight, category } = getOptimalImageSize(
                        originalWidth,
                        originalHeight,
                        imageBuffer
                    );

                    let scaledWidth = originalWidth;
                    let scaledHeight = originalHeight;

                    // Scale maintaining aspect ratio
                    if (originalWidth > maxWidth || originalHeight > maxHeight) {
                        const widthRatio = maxWidth / originalWidth;
                        const heightRatio = maxHeight / originalHeight;
                        const scaleRatio = Math.min(widthRatio, heightRatio);

                        scaledWidth = Math.round(originalWidth * scaleRatio);
                        scaledHeight = Math.round(originalHeight * scaleRatio);
                    }

                    const imageId = `img_${imageIndex++}_${Date.now()}`;
                    extractedImages.push({
                        id: imageId,
                        buffer: imageBuffer,
                        contentType: image.contentType || 'image/png',
                        filename: `document-img-${imageId}.${getImageExtension(image.contentType)}`,
                        originalWidth: originalWidth,
                        originalHeight: originalHeight,
                        scaledWidth: scaledWidth,
                        scaledHeight: scaledHeight,
                        category: category
                    });

                    console.log(`📏 ${category.toUpperCase()} Image ${imageIndex}: ${originalWidth}x${originalHeight}px → ${scaledWidth}x${scaledHeight}px`);

                    // Category-specific styling
                    let additionalStyle = '';
                    if (category === 'math') {
                        additionalStyle = 'vertical-align: middle; margin: 0 1px;';
                    } else if (category === 'symbol') {
                        additionalStyle = 'vertical-align: text-top; margin: 0 1px;';
                    } else if (category === 'chart') {
                        additionalStyle = 'vertical-align: top; margin: 5px 0;';
                    } else {
                        additionalStyle = 'vertical-align: middle; margin: 0 2px;';
                    }

                    return {
                        src: `IMAGEKIT_PLACEHOLDER_${imageId}`,
                        style: `max-width: ${scaledWidth}px; height: auto; display: inline-block; ${additionalStyle}`
                    };
                } catch (error) {
                    console.error('Image extraction failed:', error);

                    const imageId = `img_${imageIndex++}_${Date.now()}`;
                    const imageBuffer = await image.readAsBuffer();
                    extractedImages.push({
                        id: imageId,
                        buffer: imageBuffer,
                        contentType: image.contentType || 'image/png',
                        filename: `document-img-${imageId}.${getImageExtension(image.contentType)}`,
                        scaledWidth: 80,
                        scaledHeight: 60,
                        category: 'unknown'
                    });

                    return {
                        src: `IMAGEKIT_PLACEHOLDER_${imageId}`,
                        style: `max-width: 80px; height: auto; vertical-align: middle; display: inline-block;`
                    };
                }
            }),

            styleMap: [
                "p[style-name='Heading 1'] => h1:fresh",
                "p[style-name='Heading 2'] => h2:fresh",
                "p[style-name='Heading 3'] => h3:fresh",
                "p[style-name='Title'] => h1.title:fresh",
                "p[style-name='Subtitle'] => h2.subtitle:fresh",
            ]
        };

        console.log('Converting DOCX to HTML with context-aware image processing...');
        const result = await mammoth.convertToHtml({ buffer }, options);
        let htmlContent = result.value;

        // Batch upload and replace logic (same as Solution 1)
        if (extractedImages.length > 0) {
            console.log(`📥 Found ${extractedImages.length} images with categories:`,
                extractedImages.reduce((acc, img) => {
                    acc[img.category] = (acc[img.category] || 0) + 1;
                    return acc;
                }, {})
            );

            const uploadResults = await Promise.allSettled(
                extractedImages.map(async (imgData, index) => {
                    try {
                        const file = new File([imgData.buffer], imgData.filename, {
                            type: imgData.contentType
                        });

                        const formData = new FormData();
                        formData.append("file", file);
                        formData.append("fileName", imgData.filename);

                        const auth = btoa(`${process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY}:`);
                        const imagekitResponse = await fetch(`https://upload.imagekit.io/api/v1/files/upload`, {
                            method: "POST",
                            headers: { "Authorization": `Basic ${auth}` },
                            body: formData
                        });

                        if (!imagekitResponse.ok) {
                            throw new Error(`ImageKit upload failed: ${imagekitResponse.status}`);
                        }

                        const data = await imagekitResponse.json();
                        console.log(`✅ ${imgData.category} image ${index + 1} uploaded: ${imgData.scaledWidth}x${imgData.scaledHeight}px`);

                        return {
                            success: true,
                            url: data.url,
                            id: imgData.id,
                            scaledWidth: imgData.scaledWidth,
                            scaledHeight: imgData.scaledHeight,
                            category: imgData.category
                        };
                    } catch (error) {
                        console.error(`❌ Failed to upload ${imgData.category} image ${index + 1}:`, error);
                        const base64 = imgData.buffer.toString('base64');
                        return {
                            success: false,
                            url: `data:${imgData.contentType};base64,${base64}`,
                            id: imgData.id,
                            scaledWidth: imgData.scaledWidth,
                            scaledHeight: imgData.scaledHeight,
                            category: imgData.category
                        };
                    }
                })
            );

            // Replace placeholders with context-aware styling
            uploadResults.forEach((result, index) => {
                const resultValue = result.status === 'fulfilled' ? result.value : result.reason;
                if (resultValue && resultValue.id) {
                    const placeholderRegex = new RegExp(
                        `<img ([^>]*src="IMAGEKIT_PLACEHOLDER_${resultValue.id}"[^>]*)>`,
                        'g'
                    );

                    htmlContent = htmlContent.replace(placeholderRegex, (match, attributes) => {
                        let newAttributes = attributes.replace(
                            `src="IMAGEKIT_PLACEHOLDER_${resultValue.id}"`,
                            `src="${resultValue.url}"`
                        );

                        // Apply category-specific styling
                        if (resultValue.scaledWidth && resultValue.scaledHeight) {
                            let contextStyle = `max-width: ${resultValue.scaledWidth}px; height: auto; display: inline-block;`;

                            switch (resultValue.category) {
                                case 'math':
                                    contextStyle += ' vertical-align: middle; margin: 0 1px;';
                                    break;
                                case 'symbol':
                                    contextStyle += ' vertical-align: text-top; margin: 0 1px;';
                                    break;
                                case 'chart':
                                    contextStyle += ' vertical-align: top; margin: 5px 0;';
                                    break;
                                default:
                                    contextStyle += ' vertical-align: middle; margin: 0 2px;';
                            }

                            const styleRegex = /style="([^"]*)"/;
                            if (newAttributes.match(styleRegex)) {
                                newAttributes = newAttributes.replace(styleRegex, `style="${contextStyle}"`);
                            } else {
                                newAttributes += ` style="${contextStyle}"`;
                            }
                        }

                        return `<img ${newAttributes}>`;
                    });
                }
            });

            const successCount = uploadResults.filter(r =>
                r.status === 'fulfilled' && r.value.success
            ).length;
            console.log(`📊 Context-aware processing complete: ${successCount}/${extractedImages.length} images processed`);
        }

        return NextResponse.json({
            html: htmlContent,
            messages: result.messages,
            success: true,
            imagesProcessed: extractedImages.length,
            imageDimensions: extractedImages.map(img => ({
                id: img.id,
                originalWidth: img.originalWidth,
                originalHeight: img.originalHeight,
                scaledWidth: img.scaledWidth,
                scaledHeight: img.scaledHeight,
                category: img.category
            }))
        });

    } catch (error) {
        console.error('DOCX processing error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process DOCX file',
                details: error.message
            },
            { status: 500 }
        );
    }
}

function getImageExtension(contentType) {
    const extensions = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/svg+xml': 'svg',
        'image/bmp': 'bmp'
    };

    return extensions[contentType] || 'png';
}
