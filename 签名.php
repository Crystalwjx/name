<?php
//手写签名值域类型
//签名后保存为图片，值域实际值为保存后的图片地址
//通常位于uploads/sign/年/月/日/inputid.png
$showitems = '
<style>
.signbox{
    width: 302px;
    height: 152px;
    border: 1px solid #000000;
    background: #cccccc;
}
.signbox .-tablet,
.signbox .-tablet-container,
.signbox .-canvas-wrapper{
    height: 100%;
}
</style>
<img src="'.$dvalue.'" id="pre_'.$value['valueid'].'" style="border: 1px solid #000000;width:300px;height:150px;display:none;" />
<div class="signbox" id="sign_'.$value['valueid'].'"></div>
<div style="margin-top:15px;padding-right:25px;">
<button class="btn btn-success"  id="'.$value['valueid'].'_save"> 确定 </button>
<button class="btn btn-danger"  id="'.$value['valueid'].'_clear"> 重签 </button>
</div>
<input type="hidden" name="'.$value['valueid'].'" id="'.$value['valueid'].'" value="'.$dvalue.'" />
<script src="assets/js/Tablet20181017.js"></script>
<script>
    var tablet_'.$value['valueid'].';
    $(function (){
        tablet_'.$value['valueid'].' = new Tablet("#sign_'.$value['valueid'].'",{
            defaultColor: "#2e76da",
            width:"300",
            height:"150",
            onInit: function (){
                var that = this;
                that.setLineWidth(3);
            }
        });
        if($("#pre_'.$value['valueid'].'").attr("src")){
            $("#'.$value['valueid'].'_save").hide();
            $("#pre_'.$value['valueid'].'").css("display","block");
            $("#sign_'.$value['valueid'].'").css("display","none");
        }
        $("#'.$value['valueid'].'_clear").click(function(){
            $("#pre_'.$value['valueid'].'").css("display","none");
            $("#sign_'.$value['valueid'].'").css("display","block");
            $("#'.$value['valueid'].'").val("");
            tablet_'.$value['valueid'].'.clear();
            $("#'.$value['valueid'].'_save").show();
            return false;
        });
        $("#'.$value['valueid'].'_save").click(function(){
            //这里需要提交图片到服务端进行保存
            $.post("savesignpic.php",{"inputid":"'.$inputid.'","valueid":"'.$value['valueid'].'","pic":tablet_'.$value['valueid'].'.getBase64()},function(data,status){
                if(status=="success"){
                   if(data.status==0){
                        $("#'.$value['valueid'].'_save").hide();
                        $("#pre_'.$value['valueid'].'").attr("src",data.filename).css("display","block");
                        $("#sign_'.$value['valueid'].'").css("display","none");
                        $("#'.$value['valueid'].'").val(data.filename);
                   }else{
                       alert(data.message);
                   }
                }else{
                   alert("发生错误!");
                }
            });
            return false;
        });
    });        
</script>
';
