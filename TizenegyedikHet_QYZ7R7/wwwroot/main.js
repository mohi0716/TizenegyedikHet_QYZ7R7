var hotList = [];           //Az éppen gyakoroltatott kérdések listája 
var questionsInHotList = 3; //Ez majd 7 lesz, teszteléshez jobb a 3. 
var displayedQuestion;      //A hotList-ből éppen ez a kérdés van kint
var numberOfQuestions;      //Kérdések száma a teljes adatbázisban
var nextQuestion = 1;       //A következő kérdés száma a teljes listában

var displayedQuestion;      //A hotList-ből éppen ez a kérdés van kint
var numberOfQuestions;      //Kérdések száma a teljes adatbázisban
var nextQuestion = 1;      //A következő kérdés száma a teljes listában

var jóVálasz;
var questionId = 4;


window.onload = () => {
    console.log("Oldal betöltve...");
    document.getElementById("előre_gomb").onclick = előre;
    document.getElementById("vissza_gomb").onclick = vissza;
    init();
};


function init() {
    if (!localStorage.getItem("hotList")) {
        for (var i = 0; i < questionsInHotList; i++) {
            let q = {
                question: {},
                goodAnswers: 0
            }
            hotList[i] = q;
        }

        //Első kérdések letöltése
        for (var i = 0; i < questionsInHotList; i++) {
            kérdésBetöltés(nextQuestion, i);
            nextQuestion++;
        }
    } else {
        hotList = JSON.parse(localStorage.getItem("hotList"));
        nextQuestion = parseInt(localStorage.getItem("nextQuestion"));
        displayedQuestion = 0;
        console.log("Hot List found");
        kérdésMegjelenítés();
    }

    fetch('questions/count')
        .then(response => {
            if (!response.ok) {
                console.error(`Hibás kapcsolat: ${response.status}`);
            } else {
                return response.json();
            }
        })
        .then(data => {
            numberOfQuestions = data;
            console.log(data)
        });
}


function kérdésMegjelenítés() {

    let kérdés = hotList[displayedQuestion].question;
    if (!kérdés) return; //Ha undefined a kérdés objektum, nincs mit tenni

    document.getElementById("kérdés_szöveg").innerText = kérdés.question1
    document.getElementById("válasz1").innerText = kérdés.answer1
    document.getElementById("válasz2").innerText = kérdés.answer2
    document.getElementById("válasz3").innerText = kérdés.answer3
    jóVálasz = kérdés.correctAnswer;
    if (kérdés.image) {
        document.getElementById("kép1").src = "https://szoft1.comeback.hu/hajo/" + kérdés.image;
        document.getElementById("kép1").classList.remove("rejtett")
    }
    else {
        document.getElementById("kép1").classList.add("rejtett")
    }
    //Jó és rossz kérdések jelölésének levétele
    document.getElementById("válasz1").classList.remove("jó", "rossz");
    document.getElementById("válasz2").classList.remove("jó", "rossz");
    document.getElementById("válasz3").classList.remove("jó", "rossz");

    document.getElementById("válasz1").style.pointerEvents = "auto";
    document.getElementById("válasz2").style.pointerEvents = "auto";
    document.getElementById("válasz3").style.pointerEvents = "auto";
}


function kérdésBetöltés(questionNumber, destination) {

    if (questionNumber > numberOfQuestions) {
        console.warn("Out of questions!");
        return;
    }

    fetch(`/questions/${questionNumber}`)
        .then(response => {
            if (!response.ok) {
                console.error(`Hibás válasz: ${response.status}`)
                return;
            }
            else {
                return response.json()
            }
        })
        .then(q => {
            if (q == undefined) return;
            hotList[destination].question = q;
            hotList[destination].goodAnswers = 0;
            console.log(`A ${questionNumber} kérdés betöltve a hot list ${destination}-ra`);
            if (displayedQuestion == undefined && destination == 0) {
                displayedQuestion = 0;
                kérdésMegjelenítés();
            }
        }
        );
}


function válaszfeldolgozás(válasz) {
    if (!válasz.ok) {
        console.error(`Hibás válasz: ${response.status}`)
    }
    else {
        return válasz.json()
    }
}



function választás(n) {
    if (n != jóVálasz) {
        document.getElementById(`válasz${n}`).classList.add("rossz");
        document.getElementById(`válasz${jóVálasz}`).classList.add("jó");

        hotList[displayedQuestion].goodAnswers = 0;

    }
    else {
        
        document.getElementById(`válasz${jóVálasz}`).classList.add("jó");
        hotList[displayedQuestion].goodAnswers++;
        if (hotList[displayedQuestion].goodAnswers >= 3) { // 3 good answers
            console.log(`${displayedQuestion} elérte a 3 jó választ`)
            kérdésBetöltés(nextQuestion, displayedQuestion);
            nextQuestion++;
        }
    }
    console.log(hotList[displayedQuestion]);

    metés();
}

function előre() {
    displayedQuestion++;
    if (displayedQuestion == questionsInHotList) displayedQuestion = 0;
    console.log(displayedQuestion)

    kérdésMegjelenítés()
}

function vissza() {
    displayedQuestion--;
    if (displayedQuestion <= 0) displayedQuestion = 0;
    kérdésMegjelenítés();
}

function metés() {
    localStorage.setItem("hotList", JSON.stringify(hotList));
    localStorage.setItem("nextQuestion", nextQuestion);
}
