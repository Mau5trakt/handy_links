/*import { gsap } from "gsap";
import {SplitText} from "gsap/SplitText";






document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(SplitText);
    let header = SplitText.create('#header',{
        type: "chars, words, lines"
    });
    let description = SplitText.create('#description', {
        type: 'words, chars, lines'
    })


    gsap.from(header.chars, {
        y:50,
        autoAlpha: 0,
        stagger: 0.05,
        rotation:27,
        

    })

    gsap.from(description.words, {
        y:50,
        autoAlpha: 0.05,
        stagger: 0.15
    })



})*/