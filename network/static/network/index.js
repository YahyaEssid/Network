document.addEventListener('DOMContentLoaded', function() {

    // 1. Single Global Click Listener (Handles all navigation & dynamic links)
    document.addEventListener('click', function(event) {
        
        // Handle clicking any username (in posts or profile header)
        if (event.target.classList.contains('profile_user') || event.target.id === 'username') {
            show_profile(event.target.textContent);
            load_all_posts(event.target.textContent);
        }
        
        // Handle clicking "All Posts" navigation button
        else if (event.target.id === 'allPosts') {
            load_all_posts("all");
        }
        
        // Handle clicking "Following" navigation button
        else if (event.target.id === 'folowing') {
            show_folowing();
        }
        
    });

    // 2. Form Submit Listener for Creating Posts
    document.querySelector('#create_post').addEventListener('submit', function(event) {
        event.preventDefault();
        create_post();
    });

    // 3. Initial Load
    load_all_posts("all");
});

function load_all_posts(condition){
    if (condition == "all"){
        document.querySelector("#Profile").style.display = 'none';
        document.querySelector("#all_posts").style.display = 'block';
        document.querySelector("#create_post").style.display = 'block';
    }
    else if (condition == "folowing"){
        document.querySelector("#Profile").style.display = 'none';
        document.querySelector("#all_posts").style.display = 'block';
        document.querySelector("#create_post").style.display = 'none';
    }
    else {
        document.querySelector("#Profile").style.display = 'block';
        document.querySelector("#all_posts").style.display = 'block';
        document.querySelector("#create_post").style.display = 'none';
    }
    document.querySelector("#all_posts").innerHTML ='';
    fetch(`/view/${condition}`, {
        method : 'GET',
    }).then(response => response.json())
    .then(posts => {
        console.log("posts");
        posts.forEach(post => {
            const div = document.createElement("div");
            div.innerHTML = `<strong class="profile_user">${post.username}</strong>
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
        load_all_posts("all")
    })
    
}


function show_folowing(){
    document.querySelector("#create_post").style.display = 'none';
    document.querySelector("#all_posts").style.display = 'none';
    document.querySelector("#Profile").style.display = 'none';
}


function show_profile(username){
    document.querySelector("#create_post").style.display = 'none';
    document.querySelector("#all_posts").style.display = 'none';
    document.querySelector("#Profile").style.display = 'block';
    document.querySelector("#Profile").innerHTML = '';
    fetch(`/profile/${username}`)
    .then(response => response.json())
    .then(result => 
    {
        console.log(result);
        const div = document.createElement("div");
        div.innerHTML = `<strong class="profile_user">${username}</strong>
        <br>
        <p>folowwing : ${result.following}</p>
        <br>
        <p>followers : ${result.followers}</p>`
        document.querySelector("#Profile").append(div)
        
    })
}

function follow(username){
    
}


