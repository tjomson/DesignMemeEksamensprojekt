let addPageButton;
let goRightButton;
let page;
let imageInput;
let pageNumberSpan;
let textContainer;
let imageContainers;
let themes;
let currentTheme;
let themesFromApi;

let thisbook;
let collectionOfPages = [];
let pageAmount;
let currPageNumber;

let chooseTheme;

window.onload = function () {
    console.log("scripts");
    document.getElementById("left").onclick = goLeft;
    document.getElementById("right").onclick = goRight;
    document.getElementById("addPage").onclick = addPage;
    document.getElementById("addText").onclick = addTextField;

    document.querySelector('#imgInput').addEventListener('change', uploadNewImg)

    document.onkeydown = firekey;
    console.log("set firekey event");

    themes = document.getElementsByName("theme");

    window.onresize = resizePage;

    page = document.getElementById('page');
    addPageButton = document.getElementById('addPage');
    goRightButton = this.document.getElementById('right');
    imageInput = this.document.querySelector('#imgInput');
    pageNumberSpan = this.document.querySelector('.pageNumber');

    chooseTheme = this.document.getElementById("chooseTheme");

    textContainer = this.document.querySelector('.textContainer');


    imageContainers = [
        this.document.querySelector('.imageContainer[data-id="0"]'),
        this.document.querySelector('.imageContainer[data-id="1"]'),
        this.document.querySelector('.imageContainer[data-id="2"]'),
        this.document.querySelector('.imageContainer[data-id="3"]')
    ]

    let aTags = this.document.querySelectorAll('a');
    for (let i = 0; i < aTags.length; i++) {
        aTags[i].addEventListener('click', savePage)
    }

    startUp();
    getDataFromApi();
    chooseTheme.value = thisbook.theme;

    document.getElementById("booktitle").innerHTML = thisbook.title;

}

function startUp() {
    let localBooks = JSON.parse(localStorage.getItem("booklist"));
    let currBook = localStorage.getItem("currBook");
    for (let i = 0; i < localBooks.length; i++) {
        if (localBooks[i].title == currBook) {
            thisbook = localBooks[i];
        }
    }

    // Cast pages
    let tempCollectionOfPages = [];
    for (let i = 0; i < thisbook.pages.length; i++) {
        let tempPage = Object.assign(new Page(i), thisbook.pages[i]);
        let tempCollectionOfImgBoxes = [null,null,null,null];
        for (let i = 0; i < tempPage.collectionOfImgBoxes.length; i++) {
            if (tempPage.collectionOfImgBoxes[i] === null) continue;
            let tempImgBox = Object.assign(new ImgBox(), tempPage.collectionOfImgBoxes[i]);
            let tempDiv = document.createElement("div");
            tempDiv.classList.add("imgBox");
            tempDiv.classList.add("draggable");
            tempImgBox.div = tempDiv;
            tempImgBox.setURL(tempImgBox.url);         
            tempCollectionOfImgBoxes[i] = tempImgBox;
        }
        tempPage.collectionOfImgBoxes = tempCollectionOfImgBoxes;
        tempCollectionOfPages[i] = tempPage;
    }
    collectionOfPages = tempCollectionOfPages;

    pageAmount = collectionOfPages.length;
    currPageNumber = parseInt(localStorage.getItem("clickedPage"));
}


function getDataFromApi() {

    fetch('https://itu-sdbg-s2020.now.sh/api/themes')
        .then(response => response.json())
        .then(data => {
            currentTheme = thisbook.theme;
            apiData = data.themes[currentTheme];
            page.style.backgroundColor = apiData.styles.secondaryColor;
            themesFromApi = data.themes;
            setTheme(thisbook.theme);
            changeToCurrPage();
            resizePage();
            resizeLayoutInit();
        })
        .catch(error => console.error(error));
}

function firekey(e) {
    e = e || window.event;

    switch (e.keyCode) {
        case 37:
            goLeft();
            break;
        case 39:
            goRight();
            break;
    }
}

class ImgBox {
    constructor() {
        let div = document.createElement("div");
        div.classList.add("imgBox");
        div.classList.add("draggable");
        this.div = div;
    }

    getDiv() {
        return this.div;
    }

    setURL(url) {
        this.url = url;
        this.div.style.backgroundImage = "url(" + url + ")";
    }
}

// customElements.define("img-box", ImgBox); // Påkræves for at extend standart DOM elementer

function fillImageBoxes(collectionOfImgBoxes) {
    for (let i = 0; i < imageContainers.length; i++) {
        if (collectionOfImgBoxes[i] == undefined) continue;
        imageContainers[i].appendChild(collectionOfImgBoxes[i].getDiv());
    }
    initDragAndDrop(); // drag drop
}

function clearImageBoxes() {
    for (let i = 0; i < imageContainers.length; i++) {
        imageContainers[i].innerHTML = "";
    }
}

function uploadNewImg(event) {
    let url = URL.createObjectURL(event.target.files[0])
    collectionOfPages[currPageNumber - 1].addImage(url);
}

function goLeft() {
    if (currPageNumber != 1) {
        savePage();
        currPageNumber -= 1;
        changeToCurrPage();
    }
}

function goRight() {
    if (currPageNumber != pageAmount) {
        savePage();
        currPageNumber += 1;
        changeToCurrPage();
    }
}

function changeToCurrPage() {
    clearImageBoxes()
    textContainer.innerHTML = ""
    let currPage = collectionOfPages[currPageNumber - 1];
    pageNumberSpan.innerText = currPage.pageNumber + 1;

    var textlist = currPage.texts;

    for (var i = 0; i < textlist.length; i++) {
        let text = textlist[i];
        setUpTextField(text);
    }

    if (currPageNumber == pageAmount) {
        addPageButton.hidden = false;
        goRightButton.hidden = true;
    } else {
        addPageButton.hidden = true;
        goRightButton.hidden = false;
    }

    fillImageBoxes(currPage.collectionOfImgBoxes);
}

function setUpTextField(text) {
    var textField = document.createElement('input');
    textField.classList.add("pagetext");
    textField.setAttribute("type", "text");
    textField.placeholder = "Enter text here";
    textField.style.background = "transparent";
    textField.addEventListener('keyup', function () {
        var target = event.target;
        var text = target.value;
        if (text.length < 16) {
            target.size = 16;
        }
        else {
            target.size = text.length + 6;
        }
    });
    textField.value = text;
    textField.style.color = themesFromApi[currentTheme].styles.primaryColor;
    textField.style.fontFamily = themesFromApi[currentTheme].styles.fontFamily;
    textContainer.appendChild(textField);
}

function addPage() {
    pageAmount++;
    collectionOfPages.push(new Page(pageAmount - 1));

    savePage();
    currPageNumber++;
    changeToCurrPage();
}

function addTextField() {
    setUpTextField("");
}


// Ratio for A-format pages (A4 A3 ect.)
let aHeight = 1.414285714;
let aWidth = 0.7070707;

function resizePage() {
    console.log("resize");
    const pageContainer = document.querySelector('.pageContainer');

    const pageConainerIsWide = pageContainer.offsetHeight / pageContainer.offsetWidth < aHeight;
    if (pageConainerIsWide) {
        pageContainer.style.flexDirection = "column";
        page.style.width = pageContainer.offsetHeight * aWidth + "px";
        page.style.height = "auto";
    } else {
        pageContainer.style.flexDirection = "row";
        page.style.height = pageContainer.offsetWidth * aHeight + "px";
        page.style.width = "auto";
    }
}

function setThemeFromDropdown() {

    let selectedTheme = chooseTheme.value;
    currentTheme = selectedTheme;

    thisbook.theme = selectedTheme;
    let localBooks = JSON.parse(localStorage.getItem("booklist"));
    let currBook = localStorage.getItem("currBook");
    for (var i = 0; i < localBooks.length; i++) {
        if (localBooks[i].title == currBook) {
            localBooks[i] = thisbook;
        }
    }
    localStorage.setItem("booklist", JSON.stringify(localBooks));

    setTheme(currentTheme);
}

function setTheme(theme) {
    page.style.backgroundColor = "#" + themesFromApi[theme].styles.secondaryColor;

    let textFields = document.querySelectorAll('.pagetext');

    textFields.forEach(element => {
        element.style.color = "#" + themesFromApi[theme].styles.primaryColor;
        element.style.fontFamily = themesFromApi[theme].styles.fontFamily;
    });
}

function savePage() {   
    var page = collectionOfPages[currPageNumber - 1];
    var textlist = page.texts;
    textlist.splice(0, textlist.length);

    var pagetexts = document.getElementsByClassName('pagetext');
    for (var i = 0; i < pagetexts.length; i++) {
        textlist.push(pagetexts[i].value);
    }

    let localBooks = JSON.parse(localStorage.getItem("booklist"));
    for (var i = 0; i < localBooks.length; i++) {
        if (localBooks[i].title == localStorage.getItem("currBook")) {
            localBooks[i] = thisbook;          
        }
    }
    localStorage.setItem("booklist", JSON.stringify(localBooks));
}