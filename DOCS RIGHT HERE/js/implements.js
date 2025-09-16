let docs_container = document.getElementById("docs");

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

async function loadCards(){
    const cards = await getAllCards();
    if (!cards){
        console.error(`Erro ao consultar cards`)
        criarTemplateDocBranco()
        return;
    }

    docs_container.innerHTML = "";
    cards.forEach(card => {
        let div = document.createElement('div');
        div.classList.add("card");
        div.id = card['id'];
        div.innerHTML = `
            <div class="card-header">
            <div class="card-title" contenteditable="true" id="t${card['id']}">${card['title']}</div>
            <div class="menu-area">
            <input type="checkbox" class="card-select" title="Selecionar" />
            </div>
        </div>
        <hr />
        <div class="card-content" contenteditable="true" id="c${card['id']}">${card['content']}</div>
        <div class="attachments-area"></div>
        `;
        docs_container.appendChild(div)
    });
    criarTemplateDocBranco()
    // let div = document.createElement('div');
    // div.classList.add("card");
    // div.innerHTML = `
    // <div class="card-header">
    //         <div class="card-title" contenteditable="true">Criar um novo dodumento em branco</div>
    //         <div class="menu-area">
    //         <input type="checkbox" class="card-select" title="Selecionar" />
    //         </div>
    //     </div>
    //     <hr />
    //     <div class="card-content" contenteditable="true" ></div>
    //     <div class="attachments-area"></div>
    // `;
    // div.addEventListener('click', ()=>{
    //     criarDocBranco();
    // })
    // docs_container.appendChild(div);

}

function criarTemplateDocBranco(){
    let div = document.createElement('div');
    div.classList.add("card");
    div.innerHTML = `
    <div class="card-header">
            <div class="card-title" contenteditable="true">Criar um novo documento em branco</div>
            <div class="menu-area">
            <input type="checkbox" class="card-select" title="Selecionar" />
            </div>
        </div>
        <hr />
        <div class="card-content" contenteditable="true" ></div>
        <div class="attachments-area"></div>
    `;
    div.addEventListener('click', ()=>{
        criarDocBranco();
    })
    docs_container.appendChild(div);
}

async function getAllCards(){
    try{
        req = await fetch("http://localhost:8080/docs",{
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        })

        if (req.status == 204){
            alert("Não foram encontrados documentos no servidor");
            return false;
        }

        if (req.status == 200){
            return await req.json();
        }

        return false;
    }
    catch (er){
        console.error(`Erro ao comunicar com api [${er}]`);
    }
}

async function deleteById(card_id) {
    try{
        await fetch(`http://localhost:8080/docs/${card_id}`,{
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'}
        })
    }catch (er){
        console.error(`Erro ao apagar doc ${er}`);
    }

    // window.location.reload(true);
    // loadCards()
    // await sleep(100)
    loadAll()


}

async function save(card_id) {
    console.log(card_id);
    
    const title = document.getElementById(`t${card_id}`);
    const content = document.getElementById(`c${card_id}`);
    

    if (title.innerText == "" || title.innerText == "\n" && content.innerText == "" || content.innerText == "\n"){
        deleteById(card_id);
        return true;
    }

    try{
        await fetch(`http://localhost:8080/docs/${card_id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({title: title.innerHTML, content: content.innerHTML})
        })

    }catch(er){
        console.error(`Erro ao salvar [${er}]`);
    }
    
}

async function criarDocBranco(){
    try{
        await fetch("http://localhost:8080/docs",{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({title: "New document", content: "New Document"})
        })
    }catch (er){
        console.error(`Erro ao criar novo documento [${er}]`);
        
    }
    
    
    // window.location.reload(true);
    // loadCards()
    // await sleep(5000)
    loadAll()
}

// method: tipo,
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(corpo)
//         }