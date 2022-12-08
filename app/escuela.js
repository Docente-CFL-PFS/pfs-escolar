let parametros = [];
function procesarParametros() {
    parametros = [];
    let parStr = window.location.search.substr(1);
    let parArr = parStr.split("&");
    for (let i = 0; i < parArr.length; i++) {
        let par = parArr[i].split("=");
        parametros[par[0]] = par[1];
    }
}

document.querySelector("#btnRegresar").addEventListener("click", () => {
    window.location='./escuelas.html';
});

load();

////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function load() {
    try {
        escuelas = [];
        procesarParametros();
        let url = `/escuela/${parametros['idEscuela']}`;
        let respuesta = await fetch(url);
        if (respuesta.ok) {
            let escuela = await respuesta.json();
            document.querySelector("#pTitulo").innerHTML = `Escuela - ${escuela[0]['idEscuela']}`;
            document.querySelector('#nombre').value = escuela[0]['nombre'];
            document.querySelector('#domicilio').value = escuela[0]['domicilio'];
            armarReferencia("#selCiudad", "ciudad", 'idCiudad', 'idCiudad', 'nombre', escuela[0]['idCiudad']);
            // document.querySelector('#ciudad').value = escuela[0]['idCiudad'];
            document.querySelector('#acciones').innerHTML = `
            <button class="btnDelEscuela" idEscuela="${escuela[0]['idEscuela']}">Borrar</button>
            <button class="btnUpdEscuela" idEscuela="${escuela[0]['idEscuela']}">Actualizar</button>
            `;
            let btnBorrar = document.querySelector('.btnDelEscuela');
            btnBorrar.addEventListener('click', async () => {
                let idEscuela = this.getAttribute('idEscuela');
                if (await aServidor(idEscuela,'D')) {
                    document.querySelector('#acciones').innerHTML=`
                <a href="./escuelas.html">Regresar</a>
                    `;
                }    
            });
            let btnModificar = document.querySelector('.btnUpdEscuela');
            btnModificar.addEventListener('click', async () => {
                let idEscuela = btnModificar.attributes['idEscuela'].value;
                let renglon = {
                    "idEscuela" : idEscuela,
                    "nombre" : document.querySelector('#nombre').value,
                    "domicilio" : document.querySelector('#domicilio').value,
                    "idCiudad" : document.querySelector('#idCiudad').value
                }        
                if (await aServidor(renglon,'U')) {
                    document.querySelector('#acciones').innerHTML="";
                }    
            });
        } else {
            document.querySelector("#pTitulo").innerHTML = `ERROR - Fallo URL`;
        }
    } catch (error) {
        document.querySelector("#pTitulo").innerHTML = `ERROR - Fallo en Conexion`;    
    }
}

async function aServidor(datos, accion) {
    let respuesta;
    switch (accion) {
        case 'D' : {    //ELIMINACION
            respuesta = await fetch(`/escuela/${datos}`, {
                method : 'DELETE'
            });   
            break;         
        }
        case 'U': {     //ACTUALIZACION
            respuesta = await fetch(`/escuela`, {
                method : 'PUT',
                headers : { 'Content-type' : 'application/json' },
                body : JSON.stringify(datos)
            });
            break;
        }
    }
    return ((await respuesta.text()) == "ok");
}

async function armarReferencia(campo, tabla, id, codi, desc, valor) {
    let url = `./${tabla}`;
    let datos = [];
    let opciones = "";
    let respuesta = await fetch(url);
    if (respuesta.ok) {
        datos = await respuesta.json();
    }
    let cabeSelect = `<select name="" id="${(id?id:"")}">`;
    opciones += `
  <option value="0"${(valor==0?" selected":"")}></option>`;
    for (let r of datos) {
        opciones += `
  <option value="${r[codi]}"${(valor==r[codi]?" selected":"")}>${r[desc]}</option>`;
    }
    let pieSelect = `
</select>`;
    if (campo)
        document.querySelector(campo).innerHTML = cabeSelect + opciones + pieSelect;
    else
        return cabeSelect + opciones + pieSelect;
}