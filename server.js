import express from 'express';
import mongoose from 'mongoose';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mydatabase')
    .then(() => console.log('Connected'))
    .catch(err => console.error('Error', err));

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    author: {
        type: String,
        default: 'Anonymous'
    },
}, {
    timestamps: true
});

const Blog = mongoose.model('Blog', blogSchema);

app.get('/style.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.send(`
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            padding: 20px; 
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 5px;
        } 

        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 20px;
        }

        h2 {
            color: #555;
            margin-bottom: 15px;
        }

        .form-section {
            background: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
        }

        input, textarea {
            width: 100%;
            padding: 10px;
            margin-bottom: 10px;
            border: 1px solid #ddd;
            border-radius: 3px;
        }

        textarea {
            min-height: 100px;
        }
            
        button {
            background-color: #4CAF50;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            margin-right: 5px;
        }

        button:hover {
            background-color: #45a049;
        }

        .blog-card {
            border: 1px solid #ddd;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 3px;        
        }

        .blog-card h3 {
            color: #333;
            margin-bottom: 5px;  
        }

        .blog-card p {
            color: #666;
            margin-bottom: 10px;
        }

        .blog-meta {
            font-size: 12px;
            color: #999;
            margin-bottom: 10px;
        }

        .delete-button {
            background-color: #f44336; 
        }

        .delete-button:hover {
            background-color: #da190b;
        }

        .edit-button {
            background-color: #0b7dda; 
        }
        
        .cancel-button {
            background-color: #999;
        }

        .message {
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 3px;
            display: none;
        }

        .success {
            background-color: #d4edda;
            color: #155724;
        }

        .error {
            background-color: #f8d7da;
            color: #721c24;
        }
    `);
});

app.get('/script.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
        const form = document.getElementById('blog-form');
        const blogsContainer = document.getElementById('blogs-container');
        const messageDiv = document.getElementById('message');
        const formTitle = document.getElementById('form-title');
        const submitButton = document.getElementById('submit-button');
        const cancelButton = document.getElementById('cancel-button');
        const blogIdInput = document.getElementById('blog-id');

        let isEditing = false;
        
        function showMessage(text, type) {
            messageDiv.textContent = text;
            messageDiv.className = 'message ' + type;
            messageDiv.style.display = 'block';
            setTimeout(function() {
                messageDiv.style.display = 'none';
            }, 3000);
        }

        function loadBlogs() {
            fetch('/blogs')
                .then(function(response) {
                    return response.json();
                })
                .then(function(blogs) {
                    if (blogs.length === 0) {
                        blogsContainer.innerHTML = '<p>No blogs yet.</p>';
                        return;
                    }
                
                    let html = '';
                    for (let i = 0; i < blogs.length; i++) {
                        let blog = blogs[i];
                        let date = new Date(blog.createdAt).toLocaleDateString();
                        html += '<div class="blog-card">';
                        html += '<h3>' + blog.title + '</h3>';
                        html += '<p class="blog-meta">By ' + blog.author + ' • ' + date + '</p>';
                        html += '<p>' + blog.body + '</p>';
                        html += '<button class="edit-button" onclick="editBlog(\\'' + blog._id + '\\')">Edit</button>';
                        html += '<button class="delete-button" onclick="deleteBlog(\\'' + blog._id + '\\')">Delete</button>';
                        html += '</div>';
                    }
                    blogsContainer.innerHTML = html;
                })
                .catch(function(error) {
                    showMessage('Error loading blogs', 'error');
                });
        }

        function editBlog(id) {
            fetch('/blogs/' + id)
                .then(function(response) {
                    return response.json();
                })
                .then(function(blog) {
                    document.getElementById('title').value = blog.title;
                    document.getElementById('body').value = blog.body;
                    document.getElementById('author').value = blog.author;
                    blogIdInput.value = blog._id;
                    isEditing = true;
                    formTitle.textContent = 'Edit Blog Post';
                    submitButton.textContent = 'Update Post';
                    cancelButton.style.display = 'inline-block';
                })                    
                .catch(function(error) {
                    showMessage('Error loading blog', 'error');
                });
        }

        function deleteBlog(id) {
            if (!confirm('Delete this blog?')) {
                return;
            }

            fetch('/blogs/' + id, {
                method: 'DELETE'
            })
            .then(function(response) {
                if (response.ok) {
                    showMessage('Blog deleted!', 'success');
                    loadBlogs();
                } else {
                    showMessage('Error deleting blog', 'error');
                }
            })
            .catch(function(error) {
                showMessage('Error deleting blog', 'error');
            });
        }

        function resetForm() {
            isEditing = false;
            formTitle.textContent = 'Create a New Blog Post';
            submitButton.textContent = 'Create Post';
            cancelButton.style.display = 'none';
            blogIdInput.value = '';
        }
                
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const title = document.getElementById('title').value;
            const body = document.getElementById('body').value;
            const author = document.getElementById('author').value;

            if (!title || !body) {
                showMessage('Title and body are required', 'error');
                return;
            }

            const blogData = { title: title, body: body, author: author };

            let url = '/blogs';
            let method = 'POST';

            if (isEditing) {
                url = '/blogs/' + blogIdInput.value;
                method = 'PUT';
            }

            fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(blogData)
            })
            .then(function(response) {
                if(response.ok) {
                    showMessage(isEditing ? 'Blog updated!' : 'Blog created!', 'success');
                    form.reset();
                    resetForm();
                    loadBlogs();
                } else {
                    showMessage('Error saving blog', 'error');
                }
            })
            .catch(function(error) {
                showMessage('Error saving blog', 'error');
            });
        });

        cancelButton.addEventListener('click', function() {
            form.reset();
            resetForm();
        });

        loadBlogs();
    `);
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Blogging Platform</title>
            <link rel="stylesheet" href="/style.css">
        </head>
        <body>
            <div class="container">
                <h1>Blogging Platform</h1>

                <div class="form-section">
                    <h2 id="form-title">Create a New Blog Post</h2>
                    <div id="message"></div>
                    <form id="blog-form">
                        <input type="hidden" id="blog-id">
                        <input type="text" id="title" placeholder="Title" required>
                        <input type="text" id="author" placeholder="Author">
                        <textarea id="body" placeholder="Write your blog..." required></textarea>
                        <button type="submit" id="submit-button">Create Post</button>
                        <button type="button" id="cancel-button" class="cancel-button" style="display:none;">Cancel</button>
                    </form>
                </div>

                <div class="blogs-list">
                    <h2>All Blog Posts</h2>
                    <div id="blogs-container"></div>
                </div>
            </div>

            <script src="/script.js"></script>
        </body>
        </html>
    `);
});

app.post('/blogs', async (req, res) => {
    try {
        const {title, body, author} = req.body;

        if (!title || !body) {
            return res.status(400).json({error: 'Title and body are required'});
        }

        const blog = new Blog({title, body, author : author || 'Anonymous'});

        await blog.save();
        res.status(201).json(blog);
    } catch (err) {
        res.status(500).json({error: 'Error creating blog'});
    }
});

app.get('/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({createdAt: -1});
        res.json(blogs);
    } catch (err) {
        res.status(500).json({error: 'Error fetching blogs'});
    }
});

app.get('/blogs/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({message: 'Blog not found'});
        }
        
        res.json(blog);
    } catch (err) {
        res.status(500).json({error: 'Error fetching blog'});
    }
});

app.put('/blogs/:id', async (req, res) => {
    try {
        const {title, body, author} = req.body;

        if (!title || !body) {
            return res.status(400).json({error: 'Title and body are required'});
        }

        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            {title, body, author},
            {new: true, runValidators: true}
        );

        if (!blog) {
            return res.status(404).json({message: 'Blog not found'});
        }

        res.json(blog);
    } catch (err) {
        res.status(500).json({error: 'Error updating blog'});
    }
});

app.delete('/blogs/:id', async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        
        if (!blog) {
            return res.status(404).json({message: 'Blog not found'});
        }

        res.json({message: 'Blog deleted'});
    } catch (err) {
        res.status(500).json({error: 'Error deleting blog'});
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
});