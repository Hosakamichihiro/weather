async function loadHistory(){

    const res = await fetch("/api/get_history");
    const data = await res.json();

    const list = document.getElementById("history-list");
    list.innerHTML = "";

    data.forEach(item => {

        const li = document.createElement("li");

        li.innerHTML = `
            ${item.city}
            <button onclick="deleteHistory(${item.id})">削除</button>
        `;

        list.appendChild(li);
    });
}

async function deleteHistory(id){

    await fetch(`/api/delete_history/${id}`, {
        method: "DELETE"
    });

    loadHistory();
}

loadHistory();