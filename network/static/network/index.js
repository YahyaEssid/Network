document.addEventListener('DOMContentLoaded', function() {

    //use buttons to toggle between views
    document.querySelector('#allPosts').addEventListener('click', () =>
    load_all_posts());
    document.querySelector('#folowing').addEventListener('click', () =>
    show_folowing());
})

function load_all_posts(){
    form = document.querySelector("#create_post");
    form.style.display = 'block';
    form.onsumbit = function(event) {
        event.preventDefault();
        const content = document.querySelector('#post_content').value;
        fetch('/create', {
            method : 'POST',
            body: JSON.stringify({
                content : content
            })
        })
    }
}

function show_folowing(){
    document.querySelector("#create_post").style.display = 'none';
}