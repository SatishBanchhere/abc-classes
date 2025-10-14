const response = await fetch("http://localhost:3000/api/questions/get", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        examType: "JEE MAINS",
        subjectId: "Physics",
        topicName: "Work, Energy, Power and Collision"
    })
});

const data = await response.json();
console.log("Response: ", data);
