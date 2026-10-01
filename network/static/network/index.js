document.addEventListener('DOMContentLoaded', function() {

    //use buttons to toggle between views
    document.querySelector('#allPosts').addEventListener('click', () =>
    load_all_posts());
    document.querySelector('#folowing').addEventListener('click', () =>
    show_folowing());
})

function load_all_posts(){
    document.querySelector("#create_post").style.display = 'block';
}

function show_folowing(){
    document.querySelector("#create_post").style.display = 'none';
}