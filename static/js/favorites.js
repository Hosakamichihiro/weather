async function loadFav(){

    const res = await fetch("/api/get_favorites");
    const data = await res.json();

    const list = document.getElementById("fav-list");
    list.innerHTML = "";

    data.forEach(item => {

        const li = document.createElement("li");

        li.innerHTML = `
            ${item.city}
            <button onclick="deleteFav(${item.id})">削除</button>
        `;

        list.appendChild(li);
    });
}

async function deleteFav(id){

    await fetch(`/api/delete_favorite/${id}`, {
        method: "DELETE"
    });

    loadFav();
}

loadFav();