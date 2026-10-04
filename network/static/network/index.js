document.addEventListener('DOMContentLoaded', function() {

    //use buttons to toggle between views
    document.querySelector('#allPosts').addEventListener('click', () =>
    load_all_posts());
    document.querySelector('#folowing').addEventListener('click', () =>
    show_folowing());
    document.querySelector('#create_post').addEventListener('submit', function(event) {
        event.preventDefault();
        create_post();
    })
    load_all_posts();
})

function load_all_posts(){
    form = document.querySelector("#create_post");
    form.style.display = 'block';
    fetch("/view", {
        method : 'GET',
    }).then(response => response.json())
    .then(posts => {
        console.log("posts");
        posts.forEach(post => {
            const div = document.createElement("div");
            div.innerHTML = `<strong>${post.username}</strong>
            <br>
            <p>${post.content}</p>
            <div>
            <time>${post.timestamp}</time>
            <p>${post.likes}</p>
            </div>`
            document.querySelector("#all_posts").append(div);
            
        })
       
    })
}


function create_post(){
    const content = document.querySelector('#post_content').value;
    fetch('/create', {
        method : 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content : content
        })
    }).then(response => response.json())
    .then(result => {
        console.log(result)
    })
    load_all_posts()
}


function show_folowing(){
    document.querySelector("#create_post").style.display = 'none';
}