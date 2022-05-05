// Focus div based on nav button click
document.getElementById("homenav").onclick = function(){
    document.getElementById("home").className = "";
    document.getElementById("single").className = "hidden";
    document.getElementById("multi").className = "hidden";
    document.getElementById("guess").className = "hidden";
};

document.getElementById("singlenav").onclick = function(){
    document.getElementById("home").className = "hidden";
    document.getElementById("single").className = "";
    document.getElementById("multi").className = "hidden";
    document.getElementById("guess").className = "hidden";
};

document.getElementById("multinav").onclick = function(){
    document.getElementById("home").className = "hidden";
    document.getElementById("single").className = "hidden";
    document.getElementById("multi").className = "";
    document.getElementById("guess").className = "hidden";
};


document.getElementById("guessnav").onclick = function(){
    document.getElementById("home").className = "hidden";
    document.getElementById("single").className = "hidden";
    document.getElementById("multi").className = "hidden";
    document.getElementById("guess").className = "";
};


// Flip one coin and show coin image to match result when button clicked
function flipCoin() {
    const endpoint = "app/flip/";
    const url = document.baseURI+endpoint;
    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(result) {
            console.log(result);
            document.getElementById("single-result").innerHTML = result.flip;
            document.getElementById("smallcoin").setAttribute("src", "./assets/img/" + result.flip + ".png");
            coin.disabled = true;
        })
}



// Flip multiple coins and show coin images in table as well as summary results
// Enter number and press button to activate coin flip series

const multi = document.getElementById("coins");
multi.addEventListener("submit", flipCoins);

async function flipCoins(event) {
    event.preventDefault();

    const endpoint = "app/flip/coins/";
    const url = document.baseURI+endpoint;

    const formEvent = event.currentTarget;

    try {
        const formData = new FormData(formEvent);
        const flips = await sendFlips({ url, formData });

        console.log(flips);
        showMultiResults(flips.raw);
        
        if (flips.summary.heads) {
            document.getElementById("heads").innerHTML = "Heads: "+flips.summary.heads;
        } else {
            document.getElementById("heads").innerHTML = "Heads: 0";
        }

        if (flips.summary.tails) {
            document.getElementById("tails").innerHTML = "Tails: "+flips.summary.tails;
        } else {
            document.getElementById("tails").innerHTML = "Tails: 0";
        }
    } catch (error) {
        console.log(error);
    }


}

async function sendFlips({ url, formData }) {
    const plainFormData = Object.fromEntries(formData.entries());
    const formDataJson = JSON.stringify(plainFormData);
    console.log(formDataJson); 

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: formDataJson
    };
    const response = await fetch(url, options);
    return response.json();
}

function showMultiResults(multi_flips) { 
    document.getElementById('multi-result').innerHTML = "";
    for (let i=0; i < multi_flips.length; i++) {
        document.getElementById('multi-result').innerHTML += `
        <img id = "smallcoin" src="./assets/img/${multi_flips[i]}.png"></img>
        <p>${multi_flips[i]}</p>
        `
    }
}



// Guess a flip by clicking either heads or tails button
function guessHeads() {
    const endpoint = "app/flip/call/heads";
    const url = document.baseURI+endpoint;
    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(result) {
            console.log(result);
            document.getElementById("call-result").innerHTML = result.call;
            document.getElementById("calls-coin").setAttribute("src", "./assets/img/" + result.call + ".png");
            document.getElementById("flips-result").innerHTML = result.flip;
            document.getElementById("flip-coin").setAttribute("src", "./assets/img/" + result.flip + ".png");
            document.getElementById("guess-result").innerHTML = result.result;
            coin.disabled = true;
        })
}

function guessTails() {
    const endpoint = "app/flip/call/tails";
    const url = document.baseURI+endpoint;
    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(result) {
            console.log(result);
            document.getElementById("call-result").innerHTML = result.call;
            document.getElementById("calls-coin").setAttribute("src", "./assets/img/" + result.call + ".png");
            document.getElementById("flips-result").innerHTML = result.flip;
            document.getElementById("flip-coin").setAttribute("src", "./assets/img/" + result.flip + ".png");
            document.getElementById("guess-result").innerHTML = result.result;
            coin.disabled = true;
        })
}