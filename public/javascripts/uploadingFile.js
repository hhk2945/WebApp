$(document).ready(readyListener);

// Show a preview and relative information input
function readyListener(){
    var imgTarget = $('.input-group .uploadImg');

    imgTarget.on('change', function() {

        var files = $(this)[0].files;
        if (!$(this)[0].files[0].type.match(/image\//))
            return;

        for (var i in files ){
            if(files.hasOwnProperty(i)) {
                showPreview(files[i]);
            }
        }
    });

    function showPreview(file){
        var reader = new FileReader();
        var thumbnailId = file.name.replace(/(\.)|(\s)/g, '-');

        reader.onload = function myOnload(e){
            var src = e.target.result;
            $('.uploadImgList').append('<div class="uploads-display" id='+thumbnailId+'><div class="uploads-thumb-wrap"><img src="'+src+'" class="uploads-thumb"></div></div>');
        };

        reader.addEventListener('load', function () {
            $('.uploads-display#'+thumbnailId).append('<input name ="description" class="form-control" onchange="enableApply()" placeholder="'+file.name+'에 대해 해쉬태그와 함께 설명해주세요!">'
                + '<select name="privacy_level"> <option value = "public">전체공개</option> <option value = "friends">친구공개</option> <option value = "private">비공개</option> </select>'
                +'<button class="btn-danger btn" onclick="removeAttachment(this.parentNode.id)">취소하기</button><br>' );
        });
        reader.readAsDataURL(file);
    }
}

function removeAttachment(id) {
    var thumbnail = document.getElementById(id);
    var oldInput = document.getElementById('attachFile');
    var newInput = document.createElement("input");

    // Replace old input="file" to new one to clear filelist.
    newInput.type = "file";
    newInput.id = oldInput.id;
    newInput.className = oldInput.className;
    newInput.name = oldInput.name;
    newInput.style = "display: none;";
    newInput.multiple = oldInput.multiple;

    oldInput.parentNode.replaceChild(newInput, oldInput);
    $(document).ready(readyListener);

    // Remove the thumbnail of the canceled update.
    document.getElementsByClassName('uploadImgList')[0].removeChild(thumbnail);
    if ($('.uploads-display').length==0)
        document.getElementsByTagName('button')[0].disabled=true;
}

function enableApply(){
    var apply = $('button[name=apply]')[0];
    if($('input[name=description]')[0].value)
        apply.disabled=false;
    else
        apply.disabled=true;
}