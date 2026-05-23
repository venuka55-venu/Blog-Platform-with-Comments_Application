/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

interface DbUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
}

interface DbPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  coverColor: string;
  authorId: string;
  authorUsername: string;
  createdAt: string;
  updatedAt: string;
}

interface DbComment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  content: string;
  createdAt: string;
}

interface Database {
  users: DbUser[];
  posts: DbPost[];
  comments: DbComment[];
  sessions: { [token: string]: string }; // token -> userId
}

const DB_PATH = path.join(process.cwd(), "blog_db.json");

// Helper to initialize and read/write the JSON DB
function loadDatabase(): Database {
  if (!fs.existsSync(DB_PATH)) {
    // Generate initial seeds so the UI is immediately fully interactive and engaging!
    const adminId = "admin-user-id";
    const salt1 = crypto.randomBytes(16).toString("hex");
    const hash1 = crypto.createHash("sha256").update("password123" + salt1).digest("hex");

    const seedUsers: DbUser[] = [
      {
        id: adminId,
        username: "elena_design",
        email: "elena@example.com",
        passwordHash: hash1,
        passwordSalt: salt1,
        createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: "user-2-id",
        username: "developer_dan",
        email: "dan@example.com",
        passwordHash: hash1,
        passwordSalt: salt1,
        createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
      }
    ];

    const seedPosts: DbPost[] = [
      {
        id: "post-1",
        title: "The Art of Negative Space in Minimalist Interfaces",
        excerpt: "Why some of the cleanest and most luxury interfaces feel so premium. It isn't because of complex layouts, but because of intentional negative space.",
        content: `Negative space, or white space, is often misunderstood as empty space. In reality, it is the active breathing room of a user interface. Without it, your eye suffers from cognitive overload, prompting immediate visual fatigue.

### 1. Visual Hierarchy and Focal Points
When you decrease content density and envelop an element in negative space, you naturally draw the user's focus. The size of the space communicates the importance of the text or visual element. 

### 2. Typographical Rhythm
The relationship between sentence line height (leading), paragraph margins, and border padding creates a unique "rhythm" for readers. Professional designs balance this rhythm.

### 3. Practical Steps for Your Next Layout
- Double your standard desktop paddings (e.g., from 16px to 32px or 48px).
- Pair display headings with large letter tracking (e.g., tracking-wider or tracking-widest).
- Group relative parameters tightly and force generous space *between* different logical components.`,
        category: "Design",
        readTime: "4 min read",
        coverColor: "from-zinc-900 to-zinc-800 dark:from-zinc-950 dark:to-zinc-900 border border-zinc-200/20",
        authorId: adminId,
        authorUsername: "elena_design",
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: "post-2",
        title: "Ditching Redux: Elegant Local State Pipelines in React 19",
        excerpt: "Let's explore how new functional hooks, context pipelines, and structured event flows make global stores redundant for 90% of web projects.",
        content: `Over the years, state management has been a major point of discussion in the React community. Redux, MobX, and Zustand have all had their moment. But with React 19's focus on native hooks, context pipelines, and concurrent features, we can construct beautiful, declarative client-side databases with built-in mechanics.

Here is why local systems and React Context are often superior:
- **No boilerplate**: You do not need selectors, actions, dispatchers, or slice reducers.
- **Natural scopes**: State can live closer to where it is actually consumed.
- **Type safety**: TypeScript natively propagates React context dependencies without custom middleware typing.

Let's align state modeling to match the simplicity of server REST APIs, resulting in cleaner and more inspectable codebases.`,
        category: "Engineering",
        readTime: "6 min read",
        coverColor: "from-blue-900 to-indigo-950 border border-blue-500/10",
        authorId: "user-2-id",
        authorUsername: "developer_dan",
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: "post-3",
        title: "Refactoring for Speed: How to Spot and Terminate Redundant Effects",
        excerpt: "Uncontrolled useEffect hooks are the primary source of unstable state, infinity rendering, and sluggish rendering in interactive components.",
        content: `React's 'useEffect' hook is meant for synchronizing state with external systems (like browser APIs or persistent server endpoints). However, developers frequently use it to compute localized state updates derived from props.

### The Anti-Pattern
Updating one state variable in response to another state change via an Effect causes serial renders, extra layout recalculations, and complex dependency structures.

### The Solution: Derived State
Instead of storing derived attributes in separate states and synchronizing them on change, calculate them on-the-fly during the render process. Memorize expensive calculations with useMemo only if necessary. This will instantly speed up and secure your frontend systems!`,
        category: "React",
        readTime: "3 min read",
        coverColor: "from-emerald-900 to-teal-950 border border-emerald-500/10",
        authorId: "user-2-id",
        authorUsername: "developer_dan",
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      }
    ];

    const seedComments: DbComment[] = [
      {
        id: "comment-1",
        postId: "post-1",
        authorId: "user-2-id",
        authorUsername: "developer_dan",
        content: "This is brilliant Elena! I have always tended to overcrowd layouts because of my fear of empty space. The term 'typographical rhythm' really hits the nail on the head.",
        createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: "comment-2",
        postId: "post-1",
        authorId: adminId,
        authorUsername: "elena_design",
        content: "Thanks Dan! Overcrowding is super common. Try starting with 32px of margin on everything and then dial it back with discretion, rather than building additive padding. Let me know how it goes!",
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: "comment-3",
        postId: "post-2",
        authorId: adminId,
        authorUsername: "elena_design",
        content: "Totally agree on ditching Redux. React Context mixed with custom hooks provides all the capability we need for most responsive frontends with simple network APIs.",
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      }
    ];

    const defaultDb: Database = {
      users: seedUsers,
      posts: seedPosts,
      comments: seedComments,
      sessions: {},
    };

    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDb, null, 2), "utf-8");
    return defaultDb;
  }

  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Error reading database file, returning empty structure", error);
    return { users: [], posts: [], comments: [], sessions: {} };
  }
}

function saveDatabase(db: Database) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON bodies
  app.use(express.json());

  // Set up standard logger
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // DB instance
  let db = loadDatabase();

  // Middleware to authenticate Bearer tokens
  const authenticate = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Authorization header with bearer token is required" });
    }

    const userId = db.sessions[token];
    if (!userId) {
      return res.status(401).json({ error: "Invalid or expired session token" });
    }

    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return res.status(401).json({ error: "User associated with this session was not found" });
    }

    req.user = user;
    req.token = token;
    next();
  };

  // --- Auth Routes ---

  // Register
  app.post("/api/auth/register", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required fields" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.trim();

    if (normalizedUsername.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters long" });
    }

    if (normalizedEmail.indexOf("@") === -1) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Refresh DB inside route to ensure multi-tab or hot-reload synchronicity
    db = loadDatabase();

    const emailExists = db.users.some((u) => u.email.toLowerCase() === normalizedEmail);
    if (emailExists) {
      return res.status(400).json({ error: "Email address is already registered" });
    }

    const usernameExists = db.users.some((u) => u.username.toLowerCase() === normalizedUsername.toLowerCase());
    if (usernameExists) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    // Password cryptographic hashing
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.createHash("sha256").update(password + salt).digest("hex");

    const newUser: DbUser = {
      id: "user_" + crypto.randomUUID(),
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);

    // Auto log-in with fresh token
    const sessionToken = crypto.randomBytes(32).toString("hex");
    db.sessions[sessionToken] = newUser.id;

    saveDatabase(db);

    res.status(201).json({
      token: sessionToken,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  });

  // Login
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required fields" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    db = loadDatabase();

    const user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const hash = crypto.createHash("sha256").update(password + user.passwordSalt).digest("hex");
    if (hash !== user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Create a new session token
    const sessionToken = crypto.randomBytes(32).toString("hex");
    db.sessions[sessionToken] = user.id;

    saveDatabase(db);

    res.json({
      token: sessionToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  });

  // Get current user details
  app.get("/api/auth/me", authenticate, (req: any, res) => {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
    });
  });

  // Logout
  app.post("/api/auth/logout", authenticate, (req: any, res) => {
    db = loadDatabase();
    if (req.token) {
      delete db.sessions[req.token];
      saveDatabase(db);
    }
    res.json({ success: true, message: "Logged out successfully" });
  });

  // --- Blog Posts Routes ---

  // Get all blog posts
  app.get("/api/posts", (req, res) => {
    db = loadDatabase();
    // Return posts sorted by newest first
    const sortedPosts = [...db.posts].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Decorate posts with comment count
    const postsWithCommentCounts = sortedPosts.map((post) => {
      const counts = db.comments.filter((c) => c.postId === post.id).length;
      return {
        ...post,
        commentCount: counts,
      };
    });

    res.json(postsWithCommentCounts);
  });

  // Get specific post by ID with comments (one request handles full post context)
  app.get("/api/posts/:id", (req, res) => {
    db = loadDatabase();
    const post = db.posts.find((p) => p.id === req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    const comments = db.comments
      .filter((c) => c.postId === post.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    res.json({
      post: {
        ...post,
        commentCount: comments.length,
      },
      comments,
    });
  });

  // Create new blog post
  app.post("/api/posts", authenticate, (req: any, res) => {
    const { title, excerpt, content, category, coverColor } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required fields" });
    }

    db = loadDatabase();

    const newPost: DbPost = {
      id: "post_" + crypto.randomUUID(),
      title: title.trim(),
      excerpt: (excerpt || content.substring(0, 150) + "...").trim(),
      content: content,
      category: (category || "General").trim(),
      readTime: `${Math.max(1, Math.ceil(content.split(/\s+/).length / 200))} min read`,
      coverColor: coverColor || "from-gray-900 to-gray-800 border border-gray-200/15",
      authorId: req.user.id,
      authorUsername: req.user.username,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.posts.push(newPost);
    saveDatabase(db);

    res.status(201).json(newPost);
  });

  // Edit/Update a blog post
  app.put("/api/posts/:id", authenticate, (req: any, res) => {
    const { title, excerpt, content, category, coverColor } = req.body;
    const postId = req.params.id;

    db = loadDatabase();

    const postIndex = db.posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    const existingPost = db.posts[postIndex];

    // Check ownership
    if (existingPost.authorId !== req.user.id) {
      return res.status(403).json({ error: "Access denied. You can only edit your own blog posts" });
    }

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required fields" });
    }

    const updatedPost: DbPost = {
      ...existingPost,
      title: title.trim(),
      excerpt: (excerpt || content.substring(0, 150) + "...").trim(),
      content: content,
      category: (category || "General").trim(),
      readTime: `${Math.max(1, Math.ceil(content.split(/\s+/).length / 200))} min read`,
      coverColor: coverColor || existingPost.coverColor,
      updatedAt: new Date().toISOString(),
    };

    db.posts[postIndex] = updatedPost;
    saveDatabase(db);

    res.json(updatedPost);
  });

  // Delete a blog post
  app.delete("/api/posts/:id", authenticate, (req: any, res) => {
    const postId = req.params.id;

    db = loadDatabase();

    const postIndex = db.posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    const post = db.posts[postIndex];

    // Check ownership
    if (post.authorId !== req.user.id) {
      return res.status(403).json({ error: "Access denied. You can only delete your own blog posts" });
    }

    // Delete post itself
    db.posts.splice(postIndex, 1);

    // Clean up all associated comments
    db.comments = db.comments.filter((c) => c.postId !== postId);

    saveDatabase(db);

    res.json({ success: true, message: "Blog post and associated comments deleted successfully" });
  });

  // --- Comments Routes ---

  // Create a comment on a blog post
  app.post("/api/posts/:postId/comments", authenticate, (req: any, res) => {
    const postId = req.params.postId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    db = loadDatabase();

    // Check that post exists
    const postExists = db.posts.some((p) => p.id === postId);
    if (!postExists) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    const newComment: DbComment = {
      id: "comment_" + crypto.randomUUID(),
      postId: postId,
      authorId: req.user.id,
      authorUsername: req.user.username,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    db.comments.push(newComment);
    saveDatabase(db);

    res.status(201).json(newComment);
  });

  // Delete a comment
  app.delete("/api/comments/:commentId", authenticate, (req: any, res) => {
    const commentId = req.params.commentId;

    db = loadDatabase();

    const commentIndex = db.comments.findIndex((c) => c.id === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const comment = db.comments[commentIndex];
    const post = db.posts.find((p) => p.id === comment.postId);

    // Can delete if you are the comment author OR the creator of the blog post
    const isCommentAuthor = comment.authorId === req.user.id;
    const isPostAuthor = post ? post.authorId === req.user.id : false;

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ error: "Access denied. You cannot delete this comment" });
    }

    db.comments.splice(commentIndex, 1);
    saveDatabase(db);

    res.json({ success: true, message: "Comment deleted successfully" });
  });

  // --- Vite & Client Integration ---

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
