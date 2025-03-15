document.addEventListener('DOMContentLoaded', () =>{

    let openModal = false;
    let userToremove;
    let actionToSend;
    let timeoutId;
    let hasEvent = false;
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

            document.querySelector(hide).classList.toggle('hide');
            document.querySelector(show).classList.toggle('hide');
        }
    }

    // adds the hover delete icon on Colaborators or Watchers  users on folder-detail
    let iconsWithDelete = document.querySelectorAll(".folders-detail__wrapper--settings-element-users-ctn-element-image-ctn");
    if (iconsWithDelete.length > 0){
        iconsWithDelete.forEach((img) =>{
            img.addEventListener('mouseenter', () =>{
                img.querySelector("#removeUser").classList.remove('hide');
            })
            img.addEventListener('mouseleave', () =>{
                img.querySelector("#removeUser").classList.add('hide');
            })
        })
    }

    let removeUser = event =>{
        let modal = event.target.parentNode.parentNode.parentNode;
        let username = modal.dataset.username;
        fetch('/remove-user', {
            method: "POST",
            headers:headers,
            body: JSON.stringify({username: username,folder: document.querySelector("#folder_uuid").value, action:actionToSend})
        }).then(response =>{
            return response.json()
        }).then(result =>{
            if(result.status === "success"){
                modal.close();
                userToremove.classList.add("delete-item");
                setTimeout(() =>{
                    userToremove.remove();
                    userToremove = null;
                }, 1300)
            }
            event.target.removeEventListener('click', removeUser);
            hasEvent = false;
        })

        
    }

    

    let deleteUserParticipation = event =>{

        userToremove = event.target.parentNode.parentNode;
        actionToSend = userToremove.parentNode.parentNode.dataset.modal;
        // deletes a user from the collaborator or watchers list from a folder
        let container = event.target.parentNode.parentNode;
        let username = container.querySelector('#username').textContent;
        
        const  modal = document.querySelector("#alert-dialog");
        let sectionCtn = event.target.parentNode.parentNode.parentNode.parentNode;
        let message = "";



        if (event.target.classList.contains("folders-detail__wrapper--settings-element-users-ctn-element-remove-btn")){
            container = event.target.parentNode;
            username = container.querySelector('#username').textContent;
            sectionCtn = event.target.parentNode.parentNode.parentNode;
            actionToSend = sectionCtn.dataset.modal;
            userToremove = container;
        }


        if (sectionCtn.dataset.modal === "delete-collaborator"){
            message = `Do you want to remove ${username} as a collaborator?`;
        }else if(sectionCtn.dataset.modal === "delete-watcher"){
            message = `Do you want to remove ${username} as a watcher?`;
        }
        modal.setAttribute("data-action", "deleteUser");
        modal.setAttribute("data-username", username);
        let modalHeaderText = document.querySelector("#headerText");
        let bodyModal = modal.querySelector("#body");
        let footerModal = modal.querySelector("#footer");
        footerModal.innerHTML = "";
        bodyModal.innerHTML = "";
        modalHeaderText.innerText = "";
        modalHeaderText.innerText = "Confirm Action";

        let cancelBtn = document.createElement("button");
        let actionBtn = document.createElement("button");

        cancelBtn.classList.add("blue-bg");
        cancelBtn.setAttribute("id", "modalCancelBtn");
        cancelBtn.innerText = "Cancel";

        actionBtn.classList.add("red-bg");
        actionBtn.setAttribute("id", "modalActionBtn");
        actionBtn.innerText = "Remove";



        let span = document.createElement("span");
        span.classList.add("text-ctn");
        span.innerText = message;
        bodyModal.appendChild(span);
        footerModal.appendChild(cancelBtn);
        footerModal.appendChild(actionBtn);

        if(!hasEvent){   
            actionBtn.addEventListener('click', removeUser);
            hasEvent = true;
        }

        
        
        modal.showModal();
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

    let  returnNthParent = (node, n) =>{
        if (!node || n < 1) {
            return null;
        }
    
        for (let i = 0; i < n; i++) {
            if (node.parentNode) {
                node = node.parentNode;
            } else {
                return null;
            }
        }
        return node;

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

    let addLink = () =>{
        //verify if comes from a folder or any other page
        let modal = event.target.parentNode.parentNode.parentNode;
        let alertSpan = modal.querySelector('#alertSpan');
        alertSpan.classList.add('hide');
        

        let folder = document.querySelector("#folder_uuid").value;
        let username = document.querySelector("#username").value;

        if (!username){
            return;
        }
        let urlInput = modal.querySelector("#urlInput").value;
        let descriptionInput = modal.querySelector("#descriptionInput").value;
        const regexValidator =  /^(https?:\/\/)?(?:www\.)?(?:localhost|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|\[[a-fA-F0-9:]+\]|(?:[a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z0-9-]{2,})(?::\d+)?(?:\/[^\s?#]*)?(?:\?[^\s#]*)?(?:#\S*)?$/;

        if (regexValidator.test(urlInput)){
            if (urlInput.length  > 1000){
                alertSpan.innerText = 'The url is too long. Limit: 1000 chars';
                alertSpan.classList.remove('hide');
                alertSpan.classList.add('msg-show-error');
                return;
            }
            if (descriptionInput.length > 255){
                alertSpan.innerText = 'The description is too long. Limit: 255 chars';
                alertSpan.classList.remove('hide');
                alertSpan.classList.add('msg-show-error');
                return;
            }



            fetch("/add-link", {
                method: "POST",
                headers: headers,
                body: JSON.stringify({username: username, folder: folder, url: urlInput, description: descriptionInput.trim()})
            }).then( response =>{
                return response.json();
            }).then(result =>{
                
                if(result.status === 'success'){
                    console.log(result)
                    
                    let linksCtn = document.querySelector('#links');
                    if (linksCtn){
                        let newCard = document.createElement('div');
                        newCard.classList.add('folders-detail__wrapper--links-element', 'opacity-f')
                        newCard.innerHTML = `
                        <div class="folders-detail__wrapper--links-element--header"> 
                        <img src="${result.user.avatar}" alt="${result.user.username} avatar" class="folders-detail__wrapper--links-element--header-image">
                        <span class="folders-detail__wrapper--links-element--header-user">   You </span>
                    </div>
                    
                    
                    <div class="folders-detail__wrapper--links-element--body">
                        <a class="folders-detail__wrapper--links-element--body-link" href="${result.link.url}" target="_blank" title="El link del codespace">${result.link.url}</a>
                        <p class="folders-detail__wrapper--links-element--body-description">${result.link.description || ''}</p>
                    </div>
                    <div class="folders-detail__wrapper--links-element--footer">
                        <img src="/static/media/img/clip-attach-svgrepo-com.svg" alt="clip icon" title="Copy to clipboard">
                        
                            <img src="/static/media/img/pencil-svgrepo-com.svg" alt="edit icon" title="Edit this link">
                            <img src="/static/media/img/trash-can-svgrepo-com.svg" alt="delete icon" title="Delete this link">
                    </div>
                        `
                        linksCtn.insertAdjacentElement('afterbegin', newCard);
                        modal.close()
                        setTimeout(() =>{
                            newCard.classList.remove("opacity-f");
                            setTimeout(() =>{
                                newCard.classList.add('box-shadow');
                                setTimeout(() =>{
                                    newCard.classList.remove('box-shadow');
                                }, 1500)
                            }, 150);
                        }, 600);
                    }
                    


                    //insert the link into the dom and also create a little toast
                }
            })
        }
        else{
            
            alertSpan.innerText = 'Enter a valid link';
            alertSpan.classList.remove('hide');
            alertSpan.classList.add('msg-show-error');
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
                                <img src="${usersCtn.dataset.circle}" id="removeUser" alt="close icon" class="folders-detail__wrapper--settings-element-users-ctn-element-image-ctn-close-icon hide">
                            </div>
                            <span class="folders-detail__wrapper--settings-element-users-ctn-element-username" id="username">${result.username}</span>
                            <button class="folders-detail__wrapper--settings-element-users-ctn-element-remove-btn" id="removeUser"> Remove</button>`
                 usersCtn.appendChild(div);
                 div.addEventListener('mouseenter', ()  =>  div.querySelector("#removeUser").classList.remove('hide'));
                 div.addEventListener('mouseleave', ()  =>  div.querySelector("#removeUser").classList.add('hide'));

                 inputAside.value = '';
                 span.innerText = '';
                 span.classList.remove('msg-show-success');
                 addBtn.setAttribute("disabled", "");

                 setTimeout(() =>{
                    div.classList.remove("new-item");//delete animation class when it ends
                 }, 1300)

                 if (result.changeStatus){
                     let watchers = document.querySelector("#watchersCtn");
                     let users = watchers.querySelectorAll("#username");
                     users.forEach((user) =>{
                        if(user.textContent === result.username){
                            let usernameCtn = user.parentNode;
                            usernameCtn.classList.add("delete-item");
                            setTimeout(() =>{
                                usernameCtn.remove();
                            },1300)
                        }
                     })
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
        if (event.target.contains(dialog)){
            dialog.close();
        }
    }

    let closeDialog = event => {
        let modal = event.target.parentNode.parentNode.parentNode;
        modal.close();
    }

    let addLinkDialog = (event) =>{
        
        let modal = document.querySelector("#alert-dialog");
        let modalHeaderText = modal.querySelector("#headerText");
        let modalBody = modal.querySelector("#body");
        let modalFooter = modal.querySelector("#footer");

        modalBody.innerHTML = "";
        modalFooter.innerHTML = "";
        modalHeaderText.innerText = "Add new link";

         modalBody.innerHTML =  `
         <span id="alertSpan" class="hide"></span>
         <div class="folder-detail-dialog__body--field"> 
            <div class="folder-detail-dialog__body--field--info">
                <label>Url</label>
                <div class="folder-detail-dialog__body--field--info-char-count" id="charCount">
                    <span id="currentCount">0</span>
                    <span>/</span>
                    <span id="totalCount">1000</span>
                </div>
            </div>
            <input id="urlInput" placeholder="Enter link url" class="folder-detail-dialog__body--input">
        </div>
        <div class="folder-detail-dialog__body--field"> 
            <div class="folder-detail-dialog__body--field--info">
                <label>Description</label>
                <div class="folder-detail-dialog__body--field--info-char-count" id="charCount">
                    <span id="currentCount">0</span>
                    <span>/</span>
                    <span id="totalCount">255</span>
                </div>
            </div>
            <input id="descriptionInput" placeholder="Enter link description" class="folder-detail-dialog__body--input"></input>
        </div>` 
        

        
        let cancelBtn = document.createElement("button");
        let actionBtn = document.createElement("button");

        cancelBtn.classList.add("red-bg");
        cancelBtn.setAttribute("id", "modalCancelBtn");
        cancelBtn.innerText = "Cancel";
        actionBtn.classList.add("blue-bg");
        actionBtn.setAttribute("id", "modalActionBtn");
        actionBtn.innerText = "Add Link";

        actionBtn.addEventListener("click", addLink)
         
        modalFooter.appendChild(cancelBtn);
        modalFooter.appendChild(actionBtn);

        modal.showModal();


        //si está la onda esa del folder no poner el select de las carpetas

        /*  si hay algun atributo de editable pegar la informacion de esa card 
            para que sea editable
        */
        



    }

    let validateLength = event =>{
        let inputParent = returnNthParent(event.target, 1);
        let currentChars = inputParent.querySelector("#currentCount");
        let totalChars = inputParent.querySelector("#totalCount").textContent;
        let input = inputParent.querySelector("input");
        let inputChars = input.value.length;

        currentChars.textContent = inputChars;

        let charCount = inputParent.querySelector("#charCount");

        if (inputChars > totalChars){
            charCount.classList.add("msg-show-error");

        }else{
            charCount.classList.remove("msg-show-error");
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
        }else if(event.target.closest("#urlInput") || event.target.closest("#descriptionInput")){
            validateLength(event);
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
        }else if(event.target.closest("#removeUser")){
            deleteUserParticipation(event);
        }else if(event.target.closest('#searchUser')) {
            addUser(event);
        }else if(event.target.closest("#modalCloseImg") || (event.target.closest("#modalCancelBtn"))){
            closeDialog(event);
        }else if(event.target.closest("#alert-dialog")){
            dialogManage(event);
        }else if(event.target.closest("#addLink")){
            addLinkDialog(event);
        }

    })



})


