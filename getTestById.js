const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./kk-mishra-classes-firebase-adminsdk-fbsvc-d2445ccbd5.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const adminDb = admin.firestore();

async function getPhysicsQuestions(testId) {
    try {
        // Correct path: full-length-test / jeemain / {testId} / questions / physics
        const physicsRef = adminDb
            .collection("full-length-test")
            .doc("jeemain")  // Changed from "jee main" to "jeemain"
            .collection(testId)  // testId is a subcollection
            .doc("questions")
            .collection("physics");

        console.log(`Fetching physics questions for testId: ${testId}`);

        const snapshot = await physicsRef.get();

        if (snapshot.empty) {
            console.log("No physics questions found");
            return;
        }

        console.log(`Found ${snapshot.size} physics questions`);

        // Sort questions numerically (q_1, q_2, etc.)
        const sortedDocs = snapshot.docs.sort((a, b) => {
            const aNum = parseInt(a.id.split('_')[1]) || 0;
            const bNum = parseInt(b.id.split('_')[1]) || 0;
            return aNum - bNum;
        });

        // Loop through all questions (q_1, q_2, etc.)
        sortedDocs.forEach(doc => {
            console.log(`\n--- Question ${doc.id} ---`);
            const questionData = doc.data();
            console.log(JSON.stringify(questionData, null, 2));
        });

    } catch (error) {
        console.error("Error fetching physics questions:", error);
    }
}

// Usage
const testId = "test_1753209319518_kubsx1i4s";
getPhysicsQuestions(testId);
