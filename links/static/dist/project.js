document.addEventListener('DOMContentLoaded', () =>{

    let openModal = false;
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
        }
    })



})


