showNav();
if (localStorage.getItem('nickName') == null || localStorage.getItem('nickName') == '') {
    alert("登录超时，请重新登录");
    window.location.href = location.origin + "/login.html";
} else {
    $('.wel-name').html(localStorage.getItem('nickName'));
}