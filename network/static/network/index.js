document.addEventListener('DOMContentLoaded', function() {

    // 1. Single Global Click Listener (Handles all navigation & dynamic links)
    document.addEventListener('click', function(event) {
        
        // Handle clicking any username (in posts or profile header)
        if (event.target.classList.contains('profile_user')) {
            show_profile(event.target.textContent.trim());
            load_all_posts(event.target.textContent, 1);
        }
        
        // Handle clicking "All Posts" navigation button
        else if (event.target.id === 'allPosts') {
            load_all_posts("all", 1);
        }
        
        // Handle clicking "Following" navigation button
        else if (event.target.id === 'folowing') {
            show_folowing();
        }

       else if (event.target.id === "follow_btn") {
            toggle_follow(event.target.dataset.username);
        }
        
       else if (event.target.classList.contains("pagination")){
            page = parseInt(event.target.dataset.page)
            feed_type = event.target.dataset.feed_type 
            if (event.target.classList.contains("paginationPrev")){
                load_all_posts(feed_type, page - 1)
            } 
            else if (event.target.classList.contains("paginationNex")){
                load_all_posts(feed_type, page + 1) 
            }
       }
    });

    // 2. Form Submit Listener for Creating Posts
    document.querySelector('#create_post').addEventListener('submit', function(event) {
        event.preventDefault();
        create_post();
    });

    // 3. Initial Load
    load_all_posts("all", 1);
});

function load_all_posts(feed_type, page){
    if (feed_type == "all"){
        document.querySelector("#Profile").style.display = 'none';
        document.querySelector("#all_posts").style.display = 'block';
        document.querySelector("#create_post").style.display = 'block';
    }
    else if (feed_type == "following"){
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
    fetch(`/view/${feed_type}?page=${page}`, {
        method : 'GET',
    }).then(response => response.json())
    .then(data => {
        console.log(data);
        data.posts.forEach(post => {
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
       if (data.has_previous) {
                const prevBtn = document.createElement("button");
                prevBtn.innerHTML = "Previous";
                prevBtn.classList.add("pagination", "paginationPrev");
                prevBtn.dataset.page = page;
                prevBtn.dataset.feed_type = feed_type;
                document.querySelector("#all_posts").append(prevBtn);
            }

            if (data.has_next) {
                const nextBtn = document.createElement("button");
                nextBtn.innerHTML = "Next";
                nextBtn.classList.add("pagination", "paginationNex");
                nextBtn.dataset.page = page;
                nextBtn.dataset.feed_type = feed_type;
                document.querySelector("#all_posts").append(nextBtn);
            }
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
        load_all_posts("all", 1)
    })
    
}


function show_folowing(){
    load_all_posts("following",1)
}


function show_profile(username) {
    document.querySelector("#create_post").style.display = 'none';
    document.querySelector("#all_posts").style.display = 'none';
    document.querySelector("#Profile").style.display = 'block';
    document.querySelector("#Profile").innerHTML = '';

    fetch(`/profile/${username}`)
        .then(response => response.json())
        .then(result => {
            const buttonText = result.is_following ? "Unfollow" : "Follow";
            
            // Only render follow button if viewing someone else's profile
            const followButtonHTML = result.is_self ? '' : `<button id="follow_btn" data-username="${username}">${buttonText}</button>`;

            const div = document.createElement("div");
            div.innerHTML = `
                <strong class="profile_user">${result.username}</strong>
                <br>
                <p>following: <span id="following_count">${result.following}</span></p>
                <p>followers: <span id="followers_count">${result.followers}</span></p>
                ${followButtonHTML}
            `;

            document.querySelector("#Profile").append(div);
        });

    load_all_posts(username,1);
}

function is_following(username){
    fetch(`is_following/${username}`,{
        method : "GET"
    })
    .then(response => response.json())
    .then(result =>
    {
        console.log(result)
        return result.get("is_following");
    }
    )
}

function toggle_follow(username) {
    fetch(`/follow/${username}`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) return;
        const followBtn = document.querySelector("#follow_btn");
        followBtn.textContent = data.is_following ? "Unfollow" : "Follow";
        document.querySelector("#followers_count").textContent = data.followers_count;
    });
}

