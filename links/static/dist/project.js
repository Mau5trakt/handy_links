document.addEventListener('DOMContentLoaded', () =>{
    let toggleAddButton = () => {
        document.querySelector("#add-btn-dropdown").classList.toggle('dropdown__active');
        document.querySelector('.header__wrapper--nav--ul-button').classList.toggle('button__active');
    }

    let mobileMenuToggle = () => document.querySelector("#mobilemenuctn").classList.toggle('mobile-menu__active')


    document.addEventListener('click', event =>{
        if (event.target.closest(".header__wrapper--nav--ul-button")){
            toggleAddButton()
        }else if(event.target.closest("#mobilemenu")){
            mobileMenuToggle()
        }
    })







})


