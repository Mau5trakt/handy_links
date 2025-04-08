document.addEventListener("DOMContentLoaded", () => {
  let openModal = false;
  let userToremove;
  let actionToSend;
  let timeoutId;
  let linkId;
  let hasEvent = false;
  let linkElement;

  let showToast = (message, status, duration=1500) =>{

    let classNames = {
      success: 'toast-success',
      error: 'toast-error'
    }
    let toast = document.querySelector('#toast');
    let msjCtn = toast.querySelector('#toastMsj');
    toast.classList.remove('toast-active', 'toast-error', 'toast-success');

    msjCtn.innerHTML = message;
    toast.classList.add('toast-active', classNames[status]);

    setTimeout(() =>{
      toast.classList.remove('toast-active', 'toast-error', 'toast-success');
    }, duration)
  }

  let toggleAddButton = () => {
    document
      .querySelector("#add-btn-dropdown")
      .classList.toggle("dropdown__active");
    document
      .querySelector(".header__wrapper--nav--ul-button")
      .classList.toggle("button__active");
    openModal = !openModal;
  };

  let mobileMenuToggle = () =>
    document
      .querySelector("#mobilemenuctn")
      .classList.toggle("mobile-menu__active");

  let closeAddMenu = () => {
    document
      .querySelector("#add-btn-dropdown")
      .classList.remove("dropdown__active");
    document
      .querySelector(".header__wrapper--nav--ul-button")
      .classList.remove("button__active");
    openModal = false;
  };

  let toggleActive = (element) => {
    //changes the active tab in folder detail
    if (!element.classList.contains("tab_active")) {
      let remove = document.querySelector(".tab_active");
      remove.classList.remove("tab_active");
      element.classList.add("tab_active");

      let show = `#${element.dataset.show}`;
      let hide = `#${element.dataset.hide}`;

      document.querySelector(hide).classList.toggle("hide");
      document.querySelector(show).classList.toggle("hide");
    }
  };

  // adds the hover delete icon on Colaborators or Watchers  users on folder-detail
  let iconsWithDelete = document.querySelectorAll(
    ".folders-detail__wrapper--settings-element-users-ctn-element-image-ctn"
  );
  if (iconsWithDelete.length > 0) {
    iconsWithDelete.forEach((img) => {
      img.addEventListener("mouseenter", () => {
        img.querySelector("#removeUser").classList.remove("hide");
      });
      img.addEventListener("mouseleave", () => {
        img.querySelector("#removeUser").classList.add("hide");
      });
    });
  }

  let removeUser = (event) => {
    let modal = event.target.parentNode.parentNode.parentNode;
    let username = modal.dataset.username;
    fetch("/remove-user", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        username: username,
        folder: document.querySelector("#folder_uuid").value,
        action: actionToSend,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((result) => {
        if (result.status === "success") {
          modal.close();
          userToremove.classList.add("delete-item");
          setTimeout(() => {
            userToremove.remove();
            userToremove = null;
          }, 1300);
        }
        event.target.removeEventListener("click", removeUser);
        hasEvent = false;
      });
  };

  let deleteUserParticipation = (event) => {
    userToremove = event.target.parentNode.parentNode;
    actionToSend = userToremove.parentNode.parentNode.dataset.modal;

    let container = event.target.parentNode.parentNode;
    let username = container.querySelector("#username").textContent;

    const modal = document.querySelector("#alert-dialog");
    let sectionCtn = event.target.parentNode.parentNode.parentNode.parentNode;
    let message = "";

    if (
      event.target.classList.contains(
        "folders-detail__wrapper--settings-element-users-ctn-element-remove-btn"
      )
    ) {
      container = event.target.parentNode;
      username = container.querySelector("#username").textContent;
      sectionCtn = event.target.parentNode.parentNode.parentNode;
      actionToSend = sectionCtn.dataset.modal;
      userToremove = container;
    }

    if (sectionCtn.dataset.modal === "delete-collaborator") {
      message = `Do you want to remove ${username} as a collaborator?`;
    } else if (sectionCtn.dataset.modal === "delete-watcher") {
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

    if (!hasEvent) {
      actionBtn.addEventListener("click", removeUser);
      hasEvent = true;
    }

    modal.showModal();
  };

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
  let csrftoken = getCookie("csrftoken");
  let headers = {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "X-CSRFToken": csrftoken,
  };

  let returnNthParent = (node, n) => {
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
  };

  let requestUser = (event) => {
    let inputAside = event.target.parentNode.querySelector("input");
    let settingCtn = event.target.parentNode.parentNode.parentNode;
    let spanCtn = settingCtn.querySelector("#usersCtn");
    let span = spanCtn.querySelector("span");
    let addBtn = settingCtn.querySelector("#searchUser");

    span.classList.remove("msg-show-success", "msg-show-error");

    if (inputAside.value.length <= 2) {
      span.innerText = "";
      span.classList.remove("msg-show-success", "msg-show-error");
      addBtn.setAttribute("disabled", "");
    } else {
      fetch("/get-user", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          username: inputAside.value,
          action: inputAside.dataset.action,
          folder: document.querySelector("#folder_uuid").value,
        }),
      })
        .then((response) => {
          return response.json();
        })
        .then((result) => {
          if (result.status === "success") {
            span.innerText = `You can add this user as ${inputAside.dataset.action}`;
            span.classList.add("msg-show-success");
            addBtn.removeAttribute("disabled");
          } else {
            span.innerText = result.message;
            span.classList.add("msg-show-error");
            addBtn.setAttribute("disabled", "");
          }
        });
    }
  };

  let deleteLink = (linkId, linkElement) => {
    let modal = returnNthParent(event.target, 3);
    let toast = document.querySelector("#toast");
    let toastMsj = toast.querySelector("#toastMsj");

    fetch("/delete-link", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        link: linkId,
        folder: document.querySelector("#folder_uuid").value,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((result) => {
        if (result.status === "success") {
          modal.close();

          toastMsj.innerText = "Link deleted successfully";
          toast.classList.add("toast-active", "toast-success");
          linkElement.classList.add("hide-card");
          setTimeout(() => {
            toast.classList.remove("toast-active", "toast-success");
            linkElement.classList.add("hide-card");

            linkElement.remove();
          }, 1500);
        }
      })
      .catch((error) => {
        toastMsj.innerText = "There was an error deleting this link";
        toast.classList.add("toast-active", "toast-error");
        setTimeout(() => {
          toast.classList.remove("toast-active", "toast-error");
        }, 1500);
      });
  };

  let editLink = (url, description) => {
    let modal = returnNthParent(event.target, 3);
    let alertSpan = modal.querySelector("#alertSpan");
    alertSpan.classList.add("hide");
    let toast = document.querySelector("#toast");
    let toastMsj = toast.querySelector("#toastMsj");
    toast.classList.remove("toast-active", "toast-success", "toast-error");
    let folder = document.querySelector("#folder_uuid").value;
    let username = document.querySelector("#username").value;
    if (!username) {
      return;
    }
    let urlInput = modal.querySelector("#urlInput").value;
    let descriptionInput = modal.querySelector("#descriptionInput").value;

    const regexValidator =
      /^(https?:\/\/)?(?:www\.)?(?:localhost|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|\[[a-fA-F0-9:]+\]|(?:[a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z0-9-]{2,})(?::\d+)?(?:\/[^\s?#]*)?(?:\?[^\s#]*)?(?:#\S*)?$/;
    if (regexValidator.test(urlInput)) {
      if (urlInput.length > 1000) {
        alertSpan.innerText = "The url is too long. Limit: 1000 chars";
        alertSpan.classList.remove("hide");
        alertSpan.classList.add("msg-show-error");
        return;
      }
      if (descriptionInput.length > 255) {
        alertSpan.innerText = "The description is too long. Limit: 255 chars";
        alertSpan.classList.remove("hide");
        alertSpan.classList.add("msg-show-error");
        return;
      }

      if (url === urlInput && description == descriptionInput) {
        alertSpan.innerText = "The url is the same";
        alertSpan.classList.remove("hide");
        alertSpan.classList.add("msg-show-error");
        return;
      }

      fetch("/edit-link", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          username: username,
          folder: folder,
          url: urlInput,
          description: descriptionInput.trim(),
          link: linkId,
        }),
      })
        .then((response) => {
          return response.json();
        })
        .then((result) => {
          modal.close();
          linkElement.classList.add("hide-elements");
          linkElement.classList.add("box-shadow");

          setTimeout(() => {
            linkElement.querySelector(
              ".folders-detail__wrapper--links-element--body-link"
            ).innerText = result.url;
            linkElement.querySelector(
              ".folders-detail__wrapper--links-element--body-description"
            ).innerText = result.description;
          }, 400);

          setTimeout(() => {
            linkElement.classList.remove("hide-elements");
            toastMsj.innerText = "Link modifyed succesfully.";
            toast.classList.add("toast-active", "toast-success");
            setTimeout(() => {
              linkElement.classList.remove("box-shadow");
              toast.classList.remove("toast-active", "toast-success");
            }, 1000);
          }, 600);
        });
    } else {
      alertSpan.innerText = "Enter a valid link";
      alertSpan.classList.remove("hide");
      alertSpan.classList.add("msg-show-error");
    }
  };

  let addLink = () => {

    let modal = event.target.parentNode.parentNode.parentNode;
    let alertSpan = modal.querySelector("#alertSpan");
    alertSpan.classList.add("hide");
    let toast = document.querySelector("#toast");
    let toastMsj = toast.querySelector("#toastMsj");
    toast.classList.remove("toast-active", "toast-success", "toast-error");

    let folder = document.querySelector("#folder_uuid");

    if (!folder) {
      let select = modal.querySelector("select");
      folder = select.options[select.selectedIndex].value;
    } else {
      folder = folder.value;
    }

    let urlInput = modal.querySelector("#urlInput").value;
    let descriptionInput = modal.querySelector("#descriptionInput").value;
    const regexValidator =
      /^(https?:\/\/)?(?:www\.)?(?:localhost|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|\[[a-fA-F0-9:]+\]|(?:[a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z0-9-]{2,})(?::\d+)?(?:\/[^\s?#]*)?(?:\?[^\s#]*)?(?:#\S*)?$/;

    if (regexValidator.test(urlInput)) {
      if (urlInput.length > 1000) {
        alertSpan.innerText = "The url is too long. Limit: 1000 chars";
        alertSpan.classList.remove("hide");
        alertSpan.classList.add("msg-show-error");
        return;
      }
      if (descriptionInput.length > 255) {
        alertSpan.innerText = "The description is too long. Limit: 255 chars";
        alertSpan.classList.remove("hide");
        alertSpan.classList.add("msg-show-error");
        return;
      }

      fetch("/add-link", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          folder: folder,
          url: urlInput,
          description: descriptionInput.trim(),
        }),
      })
        .then((response) => {
          return response.json();
        })
        .then((result) => {
          if (result.status === "success") {
            let linksCtn = document.querySelector("#links");
            if (linksCtn) {
              let newCard = document.createElement("div");
              newCard.classList.add(
                "folders-detail__wrapper--links-element",
                "opacity-f"
              );
              newCard.setAttribute("data-link_id", result.link.id);
              newCard.innerHTML = `
                        <div class="folders-detail__wrapper--links-element--header"> 
                        <img src="${result.user.avatar}" alt="${
                result.user.username
              } avatar" class="folders-detail__wrapper--links-element--header-image">
                        <span class="folders-detail__wrapper--links-element--header-user">   You </span>
                    </div>
                    
                    
                    <div class="folders-detail__wrapper--links-element--body">
                        <a class="folders-detail__wrapper--links-element--body-link" href="${
                          result.link.url
                        }" target="_blank" title="El link del codespace">${
                result.link.url
              }</a>
                        <p class="folders-detail__wrapper--links-element--body-description">${
                          result.link.description || ""
                        }</p>
                    </div>
                    <div class="folders-detail__wrapper--links-element--footer">
                        <img src="/static/media/img/clip-attach-svgrepo-com.svg" alt="clip icon" title="Copy to clipboard" id="copyLink">
                        <img src="/static/media/img/pencil-svgrepo-com.svg" alt="edit icon" title="Edit this link" id="editLink" data-origin="card-icon">
                        <img src="/static/media/img/trash-can-svgrepo-com.svg" alt="delete icon" title="Delete this link" id="deleteLink">
                    </div>
                        `;
              linksCtn.insertAdjacentElement("afterbegin", newCard);
              setTimeout(() => {
                newCard.classList.remove("opacity-f");
                setTimeout(() => {
                  newCard.classList.add("box-shadow");
                  toastMsj.innerText = "Link added successfully.";
                  toast.classList.add("toast-active", "toast-success");
                  setTimeout(() => {
                    newCard.classList.remove("box-shadow");
                    toast.classList.remove(
                      "toast-active",
                      "toast-success",
                      "toast-error"
                    );
                  }, 1500);
                }, 150);
              }, 600);
            } else {
              toast.classList.add("toast-active", "toast-success");
              let tMessage = toast.querySelector("#toastMsj");
              tMessage.innerHTML = "Link added successfully.";
              let folders = document.querySelectorAll("#folderHomepage");
              let folderElement = false;
              folders.forEach((f) => {
                if (f.dataset.folderid === result.folder.id) {
                  folderElement = f;
                  folderElement.classList.add("hide-elements");
                }
              });

              if (folderElement) {
                setTimeout(() => {
                  folderElement.classList.remove("hide-elements");
                }, 600);
              }

              setTimeout(() => {
                toast.classList.remove(
                  "toast-active",
                  "toast-success",
                  "toast-error"
                );
              }, 1000);
            }

            modal.close();
          }
        })
        .catch((err) =>{
            alertSpan.innerText = "There was an error adding your link"          
            alertSpan.classList.remove("hide");
            alertSpan.classList.add("msg-show-error");
        });
        
        

    } else {
      alertSpan.innerText = "Enter a valid link";
      alertSpan.classList.remove("hide");
      alertSpan.classList.add("msg-show-error");
    }
  };

  let copyLink = (event) => {
    let parentDiv = returnNthParent(event.target, 2);
    let link = parentDiv.querySelector("a").textContent;
    let toast = document.querySelector("#toast");
    let toastMsj = toast.querySelector("#toastMsj");

    toast.classList.remove("toast-active", "toast-success", "toast-error");

    navigator.clipboard
      .writeText(link)
      .then(() => {
        toastMsj.innerText = "Link copied to the clipboard.";
        toast.classList.add("toast-active", "toast-success");
      })
      .catch((err) => {
        toastMsj.innerText = "Failed to copy link: " + err.message;
        toast.classList.add("toast-active", "toast-error");
      });

    setTimeout(() => {
      toast.classList.remove("toast-active", "toast-success", "toast-error");
    }, 1500);
  };

  let addUser = (event) => {
    let user = event.target.parentNode.querySelector("input").value;

    let inputAside = event.target.parentNode.querySelector("input");
    let action = inputAside.dataset.action;

    let settingCtn = event.target.parentNode.parentNode.parentNode;
    let spanCtn = settingCtn.querySelector("#usersCtn");
    let span = spanCtn.querySelector("span");

    fetch("/add-user", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        username: user,
        action: action,
        folder: document.querySelector("#folder_uuid").value,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((result) => {
        if (result.status === "success") {
          let sectionCtn = event.target.parentNode.parentNode.parentNode;
          let usersCtn = sectionCtn.querySelector("#peopleCtn");
          let div = document.createElement("div");
          let addBtn = settingCtn.querySelector("#searchUser");

          div.classList.add(
            "folders-detail__wrapper--settings-element-users-ctn-element",
            "new-item"
          );
          div.innerHTML = `<div class="folders-detail__wrapper--settings-element-users-ctn-element-image-ctn">
                                <img src="${result.avatar}" alt="${result.username} User Avatar" class="folders-detail__wrapper--settings-element-users-ctn-element-image-ctn-user-avatar">
                                <img src="${usersCtn.dataset.circle}" id="removeUser" alt="close icon" class="folders-detail__wrapper--settings-element-users-ctn-element-image-ctn-close-icon hide">
                            </div>
                            <span class="folders-detail__wrapper--settings-element-users-ctn-element-username" id="username">${result.username}</span>
                            <button class="folders-detail__wrapper--settings-element-users-ctn-element-remove-btn" id="removeUser"> Remove</button>`;
          usersCtn.appendChild(div);
          div.addEventListener("mouseenter", () =>
            div.querySelector("#removeUser").classList.remove("hide")
          );
          div.addEventListener("mouseleave", () =>
            div.querySelector("#removeUser").classList.add("hide")
          );

          inputAside.value = "";
          span.innerText = "";
          span.classList.remove("msg-show-success");
          addBtn.setAttribute("disabled", "");

          setTimeout(() => {
            div.classList.remove("new-item");
          }, 1300);

          if (result.changeStatus) {
            let watchers = document.querySelector("#watchersCtn");
            let users = watchers.querySelectorAll("#username");
            users.forEach((user) => {
              if (user.textContent === result.username) {
                let usernameCtn = user.parentNode;
                usernameCtn.classList.add("delete-item");
                setTimeout(() => {
                  usernameCtn.remove();
                }, 1300);
              }
            });
          }
        } else if (result.status === "failed") {
          span.classList.add("msg-show-error");
          span.innerText = result.message;
        }
      });
  };

  let dialogManage = (event) => {
    let dialog = document.querySelector("#alert-dialog");
    if (event.target.contains(dialog)) {
      dialog.close();
    }
  };

  let closeDialog = (event) => {
    let modal = event.target.parentNode.parentNode.parentNode;
    modal.close();
  };

  let deleteLinkDialog = (event) => {
    let modal = document.querySelector("#alert-dialog");
    let modalHeaderText = modal.querySelector("#headerText");
    let modalBody = modal.querySelector("#body");
    let modalFooter = modal.querySelector("#footer");

    modalBody.innerHTML = "";
    modalFooter.innerHTML = "";
    modalHeaderText.innerText = "Delete Link";

    let parentDiv = returnNthParent(event.target, 2);
    linkId = parentDiv.dataset.link_id;
    linkElement = parentDiv;
    modalBody.innerHTML = `<span> Would you like to delete this link? This action cannot be undone. </span>`;

    let cancelBtn = document.createElement("button");
    let actionBtn = document.createElement("button");

    cancelBtn.classList.add("blue-bg");
    cancelBtn.setAttribute("id", "modalCancelBtn");
    cancelBtn.innerText = "Cancel";
    actionBtn.classList.add("red-bg");
    actionBtn.setAttribute("id", "modalActionBtn");
    actionBtn.innerText = "Delete";

    actionBtn.addEventListener("click", () => deleteLink(linkId, linkElement));

    modalFooter.appendChild(cancelBtn);
    modalFooter.appendChild(actionBtn);
    modal.showModal();
  };

  let editLinkDialog = (event) => {
    let modal = document.querySelector("#alert-dialog");
    let modalHeaderText = modal.querySelector("#headerText");
    let modalBody = modal.querySelector("#body");
    let modalFooter = modal.querySelector("#footer");

    modalBody.innerHTML = "";
    modalFooter.innerHTML = "";
    modalHeaderText.innerText = "Edit Link";

    let parentDiv = returnNthParent(event.target, 2);
    let url = parentDiv.querySelector(
      ".folders-detail__wrapper--links-element--body-link"
    ).textContent;
    let description = parentDiv.querySelector(
      ".folders-detail__wrapper--links-element--body-description"
    ).textContent;
    linkId = parentDiv.dataset.link_id;
    linkElement = parentDiv;

    modalBody.innerHTML = `
         <span id="alertSpan" class="hide"></span>
         <div class="dialog--ctn__body--field"> 
            <div class="dialog--ctn__body--field--info">
                <label>Url</label>
                <div class="dialog--ctn__body--field--info-char-count" id="charCount">
                    <span id="currentCount">${url.length}</span>
                    <span>/</span>
                    <span id="totalCount">1000</span>
                </div>
            </div>
            <input id="urlInput" placeholder="Enter link url" class="folder-detail-dialog__body--input" value="${url}">
        </div>
        <div class="dialog--ctn__body--field"> 
            <div class="dialog--ctn__body--field--info">
                <label>Description</label>
                <div class="dialog--ctn__body--field--info-char-count" id="charCount">
                    <span id="currentCount">${description.length}</span>
                    <span>/</span>
                    <span id="totalCount">255</span>
                </div>
            </div>
            <input id="descriptionInput" placeholder="Enter link description" class="dialog--ctn__body--input" value="${description}"></input>
        </div>`;

    let cancelBtn = document.createElement("button");
    let actionBtn = document.createElement("button");

    cancelBtn.classList.add("red-bg");
    cancelBtn.setAttribute("id", "modalCancelBtn");
    cancelBtn.innerText = "Cancel";
    actionBtn.classList.add("blue-bg");
    actionBtn.setAttribute("id", "modalActionBtn");
    actionBtn.innerText = "Edit Link";

    actionBtn.addEventListener("click", () => editLink(url, description));

    modalFooter.appendChild(cancelBtn);
    modalFooter.appendChild(actionBtn);
    modal.showModal();
  };

  let addLinkDialog = (event) => {
    let modal = document.querySelector("#alert-dialog");
    let modalHeaderText = modal.querySelector("#headerText");
    let modalBody = modal.querySelector("#body");
    let modalFooter = modal.querySelector("#footer");
    let folder = document.querySelector("#folder_uuid");
    let folderSelect;
    let folders = [];

    if (!folder) {
    } else {
      folder = folder.value;
    }

    modalBody.innerHTML = "";
    modalFooter.innerHTML = "";
    modalHeaderText.innerText = "Add new link";

    modalBody.innerHTML = `
         <span id="alertSpan" class="hide"></span>
         <div class="dialog--ctn__body--field"> 
            <div class="dialog--ctn__body--field--info">
                <label>Url</label>
                <div class="dialog--ctn__body--field--info-char-count" id="charCount">
                    <span id="currentCount">0</span>
                    <span>/</span>
                    <span id="totalCount">1000</span>
                </div>
            </div>
            <input id="urlInput" placeholder="Enter link url" class="folder-detail-dialog__body--input">
        </div>
        <div class="dialog--ctn__body--field"> 
            <div class="dialog--ctn__body--field--info">
                <label>Description</label>
                <div class="dialog--ctn__body--field--info-char-count" id="charCount">
                    <span id="currentCount">0</span>
                    <span>/</span>
                    <span id="totalCount">255</span>
                </div>
            </div>
            <input id="descriptionInput" placeholder="Enter link description" class="dialog--ctn__body--input"></input>
        </div>`;

    if (!folder) {
      fetch("/get-user-folders", {
        method: "POST",
        headers: headers,
      })
        .then((response) => {
          return response.json();
        })
        .then((result) => {
          let foldersArray = result.folders;
          let options = "";
          foldersArray.forEach((f) => {
            let option = `<option value=${f.id}> ${f.title} </option>`;
            options += option;
          });
          let inputField = document.createElement("div");
          inputField.classList.add("dialog--ctn__body--field");
          inputField.innerHTML = `
            <div class="dialog--ctn__body--field--info">
                <label>Folder</label>
            </div>
            <select> 
              ${options} 
            </select>`;
          modalBody.appendChild(inputField);
        })
        .catch((err) => {
          console.error(err);
        });
    }

    let cancelBtn = document.createElement("button");
    let actionBtn = document.createElement("button");

    cancelBtn.classList.add("red-bg");
    cancelBtn.setAttribute("id", "modalCancelBtn");
    cancelBtn.innerText = "Cancel";
    actionBtn.classList.add("blue-bg");
    actionBtn.setAttribute("id", "modalActionBtn");
    actionBtn.innerText = "Add Link";

    actionBtn.addEventListener("click", addLink);

    modalFooter.appendChild(cancelBtn);
    modalFooter.appendChild(actionBtn);

    modal.showModal();
  };

  let validateLength = (event) => {
    let inputParent = returnNthParent(event.target, 1);
    let currentChars = inputParent.querySelector("#currentCount");
    let totalChars = inputParent.querySelector("#totalCount").textContent;
    let input = inputParent.querySelector("input");
    let inputChars = input.value.length;

    currentChars.textContent = inputChars;

    let charCount = inputParent.querySelector("#charCount");

    if (inputChars > totalChars) {
      charCount.classList.add("msg-show-error");
    } else {
      charCount.classList.remove("msg-show-error");
    }
  };

  let changeVisibilityBtn = event =>{
    let element;
    if (event.target.localName === "span" ){
       element = event.target.parentNode
    }
    else{
      element = event.target;
    }
    element.setAttribute("disabled", "");
    setTimeout(() =>{
      element.removeAttribute("disabled");
    }, 3000)

    let toast = document.querySelector("#toast");
    let messageCtn = toast.querySelector("#toastMsj");

    fetch("/folder-privacy",{
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        folder: document.querySelector("#folder_uuid").value,
      })

    })
    .then((response) =>{
      return response.json();
    })
    .then((result) =>{
      toast.classList.add("toast-active", "toast-success");
      messageCtn.innerText = "The privacy of your folder has been updated";
      let span = element.querySelector("span");
      span.classList.add("opacity-f");
      setTimeout(() =>{
        span.innerText = result.message;
        span.classList.remove("opacity-f");
      },400);
      

      setTimeout(() =>{
        toast.classList.remove("toast-active", "toast-success", "toast-error");
      },1500)
      
      
    })
    .catch((err) =>{
      toast.classList.add("toast-active", "toast-error");
      messageCtn.innerText = "There was an error please try later";
      setTimeout(() =>{
        toast.classList.remove("toast-active", "toast-success", "toast-error");
      },1500)
    })
  }



  let validateAvailableUsername = event =>{
    if (timeoutId){
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() =>{
      let username = event.target.value;
      let actionBtn = returnNthParent(event.target, 1).querySelector('button');
      let spanCtn = document.querySelector('#spanCtn');
      let spanElement = document.querySelector('#alertSpan');
      const emptySpaceRegex = /\s/;
      const invalidCharRegex = /^[a-zA-Z0-9@.+_-]+$/

      if (username.length > 3){

        if (emptySpaceRegex.test(username)){
          spanCtn.classList.add("show-span");
          actionBtn.setAttribute('disabled',  '');
          spanElement.innerText = "Username can't have white spaces";
          spanElement.classList.add("msg-show-error");
          spanElement.classList.remove("msg-show-success");
          return;
        }
        if (!invalidCharRegex.test(username)){
          spanCtn.classList.add("show-span");
          actionBtn.setAttribute('disabled',  '');
          spanElement.innerText = "Allowed chars @ . + - and _";
          spanElement.classList.add("msg-show-error");
          spanElement.classList.remove("msg-show-success");
          return;
        }

        //Do the fetch then change the username and generate the avatar to redirect :)


        fetch("/lookup-username", {
          method: "POST",
          headers: headers,
          body : JSON.stringify({username: username})
        }).then( response => {return response.json()})
            .then( result =>{
                  if (result.status === "success"){
                    actionBtn.removeAttribute('disabled');
                    spanCtn.classList.add("show-span");
                    spanElement.innerText = result.message;
                    spanElement.classList.add("msg-show-success");
                    spanElement.classList.remove("msg-show-error");
                    return;
                  }
                  spanCtn.classList.add("show-span");
                  actionBtn.setAttribute('disabled',  '');
                  spanElement.innerText = result.message;
                  spanElement.classList.add("msg-show-error");
                  spanElement.classList.remove("msg-show-success");
            });
        return;
      }
        actionBtn.setAttribute('disabled',  '');
        spanCtn.classList.remove("show-span");
    }, 500)


  };

  let setUsername = event => {
    let username;
    if(event.target.id==="setUsernameBtn"){
      username = document.querySelector("#searchUsername").value;
    }

    fetch('/set-username',{
      method: "POST",
      headers: headers,
      body: JSON.stringify({username:username})
    }).then(response => {return response.json()})
        .then( result =>{
          console.log(result);
          if (result.status === 'success'){
            window.location.href = `${window.location.protocol}//${window.location.host}`;
          }
          else{
            showToast(
              'There was an error during this action, please try later',
              'error',
              );
          }

        }).catch((err) =>{
          console.error(err);
          showToast(
              'There was an error during this action, please try later',
              'error',
              );



    })

  }


  document.addEventListener("input", (event) => {
    if (
      event.target.closest("#addcollaborator") ||
      event.target.closest("#addwatcher")
    ) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        requestUser(event);
      }, 500);
    } else if (
      event.target.closest("#urlInput") ||
      event.target.closest("#descriptionInput")
    ) {
      validateLength(event);
    }
    else if (
        event.target.closest("#searchUsername")
    ) {
      validateAvailableUsername(event);
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".header__wrapper--nav--ul-button")) {
      toggleAddButton();
    } else if (event.target.closest("#addLink")) {
      addLinkDialog(event);
    } else if (event.target.closest("#mobilemenu")) {
      mobileMenuToggle();
    } else if (event.target.closest("#folderCreationLink")) {
      window.location.href = `${window.location.protocol}//${window.location.host}/create-folder/`;
    } else if (openModal) {
      closeAddMenu();
    } else if (event.target.closest(".folders-detail__wrapper--tabs-element")) {
      toggleActive(event.target);
    } else if (event.target.closest("#removeUser")) {
      deleteUserParticipation(event);
    } else if (event.target.closest("#searchUser")) {
      addUser(event);
    } else if (
      event.target.closest("#modalCloseImg") ||
      event.target.closest("#modalCancelBtn")
    ) {
      closeDialog(event);
    } else if (event.target.closest("#alert-dialog")) {
      dialogManage(event);
    } else if (event.target.closest("#copyLink")) {
      copyLink(event);
    } else if (event.target.closest("#editLink")) {
      editLinkDialog(event);
    } else if (event.target.closest("#deleteLink")) {
      deleteLinkDialog(event);
    } else if (event.target.closest("#privacityLinkBtn")){
      changeVisibilityBtn(event);
    } else if (event.target.closest("#setUsernameBtn")){
      setUsername(event);
    }

  });
});
