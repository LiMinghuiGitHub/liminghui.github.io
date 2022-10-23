function logion2(){
    if(document.getElementById("userAccount").value=="admin"&&document.getElementById("userPwd").value=="admin"){
        window.open("../html/Main.html");
    }
    else{
        window.alert("用户名密码错误！");
        // document.getElementById("loginButton").innerText="重新登录";
    }
}