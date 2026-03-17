function loadHistory(){

    const list = document.getElementById("history-list");

    const history = JSON.parse(localStorage.getItem("history")) || [];

    list.innerHTML = "";

    history.forEach(city => {

        const li = document.createElement("li");

        li.innerHTML = `
            ${city}
            <button onclick="deleteHistory('${city}')" class="delete-btn">
                <img src="assets/images/delete_icons.svg">
            </button>
        `;

        list.appendChild(li);

    });

}

function deleteHistory(city){

    let history = JSON.parse(localStorage.getItem("history")) || [];

    history = history.filter(item => item !== city);

    localStorage.setItem("history", JSON.stringify(history));

    loadHistory();

}

function clearHistory(){

    localStorage.removeItem("history");

    loadHistory();

}

loadHistory();