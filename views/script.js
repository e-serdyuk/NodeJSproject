function signUp() {

    var loginElem = document.getElementById('loginInputReg');
    var passElem = document.getElementById('passInputReg');
    if (loginElem.value && passElem.value) {
        var obj = JSON.parse('{"userName":"' + loginElem.value + '","pass":"' + passElem.value + '"}');

        xhtpUserRegistration(obj, function(err, result) {

            if (err) {
                console.log(err)
            }

            if (result.status === 1) {
                alert('User ' + loginElem.value + ' was successfully registered')
                window.location.href = '/home';
            } else if (result.status === 2) {
                alert('This user ' + loginElem.value + ' was already registered earlier')


            } else {
                console.log('Server error. Sorry');
            }


        })

    } else {

    }
}

function xhtpUserRegistration(dataObj, cb) {

    const xhtr = new XMLHttpRequest();

    xhtr.open('POST', '/registerUser', true);
    xhtr.setRequestHeader('Content-type', 'application/json');

    xhtr.send(JSON.stringify(dataObj));

    xhtr.onload = function() {

        var obj = JSON.parse(xhtr.responseText);

        if (xhtr.status === 200) {
            return cb('', obj);
        }
    }

}

function getData(param, func) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function(data) {
        return func(xhr.responseText);
    };
    xhr.open('GET', param, true);
    xhr.send();
}

function showData(p) {
    getData(p, function(data) {
        var users = JSON.parse(data);

        var tableElemTable = document.getElementById('table_show');
        tableElemTable.innerHTML = ""
        var f = document.createElement('figure');
        for (var n = 0; n < users.length; n++) {
            var elem2 = document.createElement('img');
            var f = document.createElement('figure');
            elem2.setAttribute("src", '../views/' + users[n].src);
            elem2.setAttribute("class", 'projects');
            var ff = document.createElement('figcaption');
            var a1 = document.createElement('a');
            var a2 = document.createElement('a');
            var a3 = document.createElement('a');
            a1.setAttribute("href", '/edit/' + users[n].id);
            a1.setAttribute("class", 'projects_edit');
            ff.appendChild(a1)
            a2.setAttribute("href", '/view/' + users[n].id);
            a2.setAttribute("class", 'projects_view');
            ff.appendChild(a2)
            a3.setAttribute("onclick", "deleteItem(" + users[n].id + ")");
            a3.setAttribute("class", 'projects_delete');
            ff.appendChild(a3)

            f.appendChild(ff)
            f.appendChild(elem2)
            tableElemTable.appendChild(f)

        }
        var elemAdd = document.createElement('img');
        var aAdd = document.createElement('a');
        var f = document.createElement('figure');
        elemAdd.setAttribute("src", '../views/images/plus_area.png');
        elemAdd.setAttribute("class", 'projects add_item');

        aAdd.setAttribute("href", '/new');
        aAdd.appendChild(elemAdd)
        f.appendChild(aAdd)
        tableElemTable.appendChild(f)
        console.log(data)
    });
}

function xhrDeleteItem(id, func) {
    var xhr = new XMLHttpRequest();
    xhr.open('DELETE', '/delete/' + id, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send();
    xhr.onload = function() {
        return func(xhr.status, xhr.responseText);
    }
}

function deleteItem(id) {

    xhrDeleteItem(id, function(status, result) {
        console.log("status=" + status + "result=" + result)
        if (status === 200 && result) {
            window.location.href = '/';
        } else if (status === 404 && result) {
            window.location.href = '/register';
        } else {
            console.log('Error during delete');
        }
    })

}

function xhrChangeItem(data, id, func) {
    let xhttp = new XMLHttpRequest();
    xhttp.open('PUT', '/update/' + id, true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(data));
    xhttp.onload = function() {
        return func(xhttp.status);
    }
}

function changeItem(id) {
    var el1 = document.getElementsByName('title')[0];
    var el2 = document.getElementsByName('author')[0];
    var el3 = document.getElementsByName('Category')[0];
    var el4 = document.getElementsByName('Description')[0];
    if (el1.value && el2.value && el3.value && el4.value) {
        var obj = JSON.parse('{"title":"' + el1.value + '", "author":"' + el2.value + '", "category":"' + el3.value + '","description":"' + el4.value + '","id":"' + id + '"}');
        xhrChangeItem(obj, id, function(status) {
            if (status === 200) {
                window.location.href = '/';
            }
        })

    } else alert("The field(s) are empty")
}

function getFileName() {

    var file = document.getElementById('uploaded-file').value;

    file = file.split("\\")[2];

    document.getElementById('file-name').innerHTML = 'Имя файла: ' + file;

}

function logOut() {
    window.location.href = '/logout';
}

function contact() {
    window.location.href = '/contact';
}

function print() {
    showData('/print')
    checkColor('print')
}

function photo() {
    showData('/photo')
    checkColor('photo')
}

function web() {
    showData("/web")
    checkColor('web')
}

function app() {
    showData("/app")
    checkColor('applications')
}

function showAll() {
    showData('/get-data')
    checkColor('all')
}

function checkColor(param) {
    document.getElementsByClassName('all')[0].style.color = "#8a8888";
    document.getElementsByClassName('print')[0].style.color = "#8a8888";
    document.getElementsByClassName('photo')[0].style.color = "#8a8888";
    document.getElementsByClassName('web')[0].style.color = "#8a8888";
    document.getElementsByClassName('applications')[0].style.color = "#8a8888";
    document.getElementsByClassName(param)[0].style.color = "#2ecc71";
}

function login() {
    var el1 = document.getElementById('loginInput');
    var el2 = document.getElementById('passInput');
    var el3 = document.getElementsByClassName('login_span')[0];
    if (el1.value && el2.value) {
        var obj = JSON.parse('{"userName":"' + el1.value + '","pass":"' + el2.value + '"}');
        userLogin(obj, function(result) {
            if (result.message === 1) {
                alert('You logged as ' + result.sessionUserName)
                window.location.href = '/home';

            } else if (result.message === 0) {
                alert('Check your login and pass')
            }
        })

    } else {
        alert('Please enter login and password')
    }
}

function userLogin(obj, func) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/userLogin', true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(obj));
    xhr.onload = function() {
        if (xhr.status === 200) {
            return func(JSON.parse(xhr.responseText));
        }
    }
}
function xhrCheck(id, func) {
    var xhr = new XMLHttpRequest ();
    var path = '/checkId/'+id;
    xhr.open ('GET', path, true);
    xhr.setRequestHeader ('Content-type', 'application/json');
    xhr.send ();
    xhr.onload = function () {
        if (xhr.status === 200 && +xhr.responseText) {
            return func (true);
        } else {
            return func (false);
        }
    }
}

function forgotpass() {
    var el1 = document.getElementById('forgotpass');


    if (el1.value) {
        xhrCheck(el1.value, function (isIdExist) {
        if (isIdExist) { 
        var obj = JSON.parse('{"userName":"' + el1.value + '"}');
        forgotXhr(obj, function(result) {
            
        })
        } else {
              alert(' this user can not found, try again');
            }

       })
    } else {
        alert('Please enter login')
    }
}

function forgotXhr(obj, func) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/resetpass', true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(obj));
    xhr.onload = function() {
        if (xhr.status === 200) {
            alert("Please check your mail to reset password;")
            return func(xhr.responseText);
        }
    }
    //   
}

function resetPassword() {

    var el1 = document.getElementById('resetPasswordRecovery1');
    var el2 = document.getElementById('resetPasswordRecovery2');
    var el3 = document.getElementsByClassName('usertorecoveryspan')[0];
    if (el1.value === el2.value) {
        var obj = JSON.parse('{"userName":"' + el3.innerHTML + '","pass":"' + el1.value + '"}');
        userPassWordRecoveryXhr(obj, function(result) {
            window.location.href = '/home';
        })

    } else {
        alert('The passwords are not match, please check the fields')
    }

}

function userPassWordRecoveryXhr(obj, func) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/passchange', true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(obj));
    xhr.onload = function() {
        if (xhr.status === 200) {
            return func(xhr.responseText);
        }
    }
}
function deleteClasses() {
    var el1 = document.getElementsByClassName('view_head')[0].innerHTML="";
    var el2 = document.getElementsByClassName('view_description')[0].innerHTML="";
}