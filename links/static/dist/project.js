document.addEventListener('DOMContentLoaded', () =>{

    let openModal = false;
    let timeoutId;
    let toggleAddButton = () => {
        document.querySelector("#add-btn-dropdown").classList.toggle('dropdown__active');
        document.querySelector('.header__wrapper--nav--ul-button').classList.toggle('button__active');
        openModal = !openModal;
    }

    let mobileMenuToggle = () => document.querySelector("#mobilemenuctn").classList.toggle('mobile-menu__active');

    let closeAddMenu = () =>{
        document.querySelector("#add-btn-dropdown").classList.remove('dropdown__active');
        document.querySelector('.header__wrapper--nav--ul-button').classList.remove('button__active');
        openModal = false;
    }

    let toggleActive = element =>{
        //changes the active tab in folder detail
        if (!element.classList.contains("tab_active")){
            let remove = document.querySelector('.tab_active')
            remove.classList.remove('tab_active');
            element.classList.add('tab_active');

            let show = `#${element.dataset.show}`
            let hide = `#${element.dataset.hide}`

            document.querySelector(hide).classList.toggle('hide')
            document.querySelector(show).classList.toggle('hide')
        }
    }

    // adds the hover delete icon on Colaborators or Watchers  users on folder-detail
    let iconsWithDelete = document.querySelectorAll(".folders-detail__wrapper--settings-element-users-ctn-element-image-ctn")
    if (iconsWithDelete.length > 0){
        iconsWithDelete.forEach((img) =>{
            img.addEventListener('mouseenter', () =>{
                img.querySelector("#close").classList.remove('hide');
            })
            img.addEventListener('mouseleave', () =>{
                img.querySelector("#close").classList.add('hide');
            })
        })
    }

    let deleteUserParticipation = event =>{
        // deletes a user from the collaborator or watchers list from a folder
        let container = event.target.parentNode.parentNode
        let username = container.querySelector('#username').textContent
        container.classList.add("delete-item");
        const  modal = document.querySelector("#alert-dialog");
        let sectionCtn = event.target.parentNode.parentNode.parentNode.parentNode;
        console.log(sectionCtn.dataset.modal);
        let message = "";

        if (sectionCtn.dataset.modal === "delete-collaborator"){
            message = `Do you want to remove ${username} as a collaborator?`;
        }

        modal.setAttribute("data-action", "deleteUser");
        modal.setAttribute("data-username", username);
        let messageText = modal.querySelector("#text-ctn");
        messageText.innerText = message;
        modal.showModal();  
        console.log("llega al final de la funcion?")      
    }

    function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
    let csrftoken = getCookie("csrftoken");
    let headers = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': csrftoken,
    }

    let requestUser = event =>{
        let inputAside = event.target.parentNode.querySelector('input');
        let settingCtn = event.target.parentNode.parentNode.parentNode;
        let spanCtn = settingCtn.querySelector('#usersCtn');
        let span = spanCtn.querySelector("span");
        let addBtn = settingCtn.querySelector('#searchUser')


        span.classList.remove("msg-show-success", "msg-show-error");

        if(inputAside.value.length <= 2){
            span.innerText = '';
            span.classList.remove("msg-show-success", "msg-show-error");
            addBtn.setAttribute('disabled', '');
        }
        else{
            fetch("/get-user", {
                method: "POST",
                headers: headers,
                body: JSON.stringify({username: inputAside.value,
                                            action:inputAside.dataset.action,
                                            folder: document.querySelector("#folder_uuid").value
                })

            })
            .then(response =>{
                return response.json()
            })
            .then(result =>{
                if(result.status === "success"){
                    span.innerText = `You can add this user as ${inputAside.dataset.action}`;
                    span.classList.add("msg-show-success");
                    addBtn.removeAttribute('disabled');
                }else{
                    span.innerText = result.message;
                    span.classList.add("msg-show-error");
                    addBtn.setAttribute('disabled', '');
                }
            })
        }
    }

    let addUser = event =>{
        let user = event.target.parentNode.querySelector("input").value;

        let inputAside = event.target.parentNode.querySelector('input');
        let action = inputAside.dataset.action

        let settingCtn = event.target.parentNode.parentNode.parentNode;
        let spanCtn = settingCtn.querySelector('#usersCtn');
        let span = spanCtn.querySelector("span");

        fetch('/add-user', {
            method: "POST",
            headers: headers,
            body: JSON.stringify({"username": user, 'action': action, 'folder': document.querySelector("#folder_uuid").value})
        }).then(response =>{
            return response.json()
        }).then(result =>{
             if(result.status === "success"){
                 let sectionCtn = event.target.parentNode.parentNode.parentNode;
                 let usersCtn = sectionCtn.querySelector("#peopleCtn");
                 let div = document.createElement('div');
                 let addBtn = settingCtn.querySelector('#searchUser');

                 div.classList.add('folders-detail__wrapper--settings-element-users-ctn-element', 'new-item')
                 div.innerHTML = `<div class="folders-detail__wrapper--settings-element-users-ctn-element-image-ctn">
                                <img src="${result.avatar}" alt="${result.username} User Avatar" class="folders-detail__wrapper--settings-element-users-ctn-element-image-ctn-user-avatar">
                                <img src="${usersCtn.dataset.circle}" id="close" alt="close icon" class="folders-detail__wrapper--settings-element-users-ctn-element-image-ctn-close-icon hide">
                            </div>
                            <span class="folders-detail__wrapper--settings-element-users-ctn-element-username" id="username">${result.username}</span>`
                 usersCtn.appendChild(div);
                 div.addEventListener('mouseenter', ()  =>  div.querySelector("#close").classList.remove('hide'));
                 div.addEventListener('mouseleave', ()  =>  div.querySelector("#close").classList.add('hide'));

                 inputAside.value = '';
                 span.innerText = '';
                 span.classList.remove('msg-show-success');
                 addBtn.setAttribute("disabled", "");

                 console.log(result);

                 if (result.changeStatus){
                     console.log("a borrar");

                 }


             }
             else if(result.status === "failed"){
                 span.classList.add('msg-show-error');
                 span.innerText = result.message;
             }
        })

    }

    let dialogManage = (event) =>{
        let dialog = document.querySelector("#alert-dialog")
        let username = dialog.dataset.username;

        if (event.target.contains(dialog)){
            dialog.close();
        }
        

        
    }

    let closeDialog = event => {
        let modal = event.target.parentNode.parentNode.parentNode;
        modal.close();
        


        if(event.target.id === "modalCancelBtn"){
            console.log("Fue el botón");
        }
        else if(event.target.id === "modalCloseImg"){
            console.log("Fue el icono");
        }   
    }


    document.addEventListener('input', event =>{
        if (event.target.closest("#addcollaborator") || event.target.closest("#addwatcher"))  {
            if(timeoutId){
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() =>{
                requestUser(event);
            }, 500)
        }

    })


    document.addEventListener('click', event =>{

        if (event.target.closest(".header__wrapper--nav--ul-button")){
            toggleAddButton();
        }else if(event.target.closest("#mobilemenu")){
            mobileMenuToggle();
        }else if(event.target.closest("#folderCreationLink")){
            window.location.href = `${window.location.protocol}//${window.location.host}/create-folder/`;
        } else if(openModal){
            closeAddMenu();
        }else if(event.target.closest(".folders-detail__wrapper--tabs-element")){
            toggleActive(event.target);
        }else if(event.target.closest("#close")){
            deleteUserParticipation(event);
        }else if(event.target.closest('#searchUser')) {
            addUser(event);
        }else if(event.target.closest("#modalCloseImg") || (event.target.closest("#modalCancelBtn"))){
            closeDialog(event);
        }else if(event.target.closest("#alert-dialog")){
            dialogManage(event);
        }

    })



})


