import React, { useState } from 'react';
import { 
    MessageCircle, Share2, Heart, Send, 
    MoreHorizontal, Feather, Bookmark, Image as ImageIcon
} from 'lucide-react';
import './CommunityPage.css';

const CommunityPage = () => {
    // Dữ liệu mẫu
    const [posts, setPosts] = useState([
        {
            id: 1,
            author: "Vũ Trung Tùy Bút",
            avatar: "https://ui-avatars.com/api/?name=Vu+Trung&background=5d4037&color=fff&font-size=0.5",
            time: "2 giờ trước",
            content: "Nhân dịp xuân về, tại hạ xin chia sẻ một bài khảo cứu về thú chơi hoa thủy tiên của người Hà Nội xưa. Mời các vị cùng thưởng lãm.",
            link: {
                title: "Thú chơi hoa Thủy Tiên - Nét đẹp văn hóa",
                source: "thuvienhanoi.org",
                img: "https://images.unsplash.com/photo-1516205651411-a427963e9e3d?q=80&w=2074&auto=format&fit=crop"
            },
            likes: 45,
            comments: [
                { id: 101, author: "Nguyễn Tuân", text: "Văn phong rất đỗi nhẹ nhàng. Đáng khen!" }
            ],
            isLiked: false,
            showComments: true
        },
        {
            id: 2,
            author: "Đại Việt Cổ Phong",
            avatar: "https://ui-avatars.com/api/?name=Dai+Viet&background=2c1e1a&color=fff&font-size=0.5",
            time: "Hôm qua",
            content: "Có ai biết ở đâu còn bán giấy dó thủ công chất lượng tốt để viết thư pháp không? Tại hạ đang cần tìm gấp.",
            likes: 12,
            comments: [],
            isLiked: true,
            showComments: false
        }
    ]);

    const [inputVal, setInputVal] = useState("");

    // Xử lý tương tác
    const handleLike = (id) => {
        setPosts(posts.map(p => p.id === id ? {...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1} : p));
    };

    const toggleComments = (id) => {
        setPosts(posts.map(p => p.id === id ? {...p, showComments: !p.showComments} : p));
    };

    return (
        <div className="container">
            {/* Header */}
            <header className="page-header">
                <h1 className="brand-title">Thiên Hạ Luận Đàm</h1>
                <span className="brand-subtitle">Nơi tao nhân mặc khách hội ngộ</span>
            </header>

            {/* Composer (Khung đăng bài) */}
            <div className="composer-box">
                <div className="corner-decor tl"></div>
                <div className="corner-decor tr"></div>
                <div className="corner-decor bl"></div>
                <div className="corner-decor br"></div>

                <div className="composer-input-group">
                    <img className="avatar" src="https://ui-avatars.com/api/?name=User&background=9a2a2a&color=fff" alt="Me" />
                    <textarea 
                        className="composer-textarea" 
                        placeholder="Các hạ đang có tâm sự gì?"
                        rows={2}
                    />
                </div>
                <div className="composer-footer">
                    <div style={{display: 'flex', gap: '15px', color: '#5d4037'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.9rem'}}>
                            <ImageIcon size={18}/> Ảnh
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.9rem'}}>
                            <Feather size={18}/> Thư pháp
                        </div>
                    </div>
                    <button className="btn-seal">
                        <Send size={16} /> Đăng Bài
                    </button>
                </div>
            </div>

            {/* Feed List */}
            <div className="feed">
                {posts.map(post => (
                    <article key={post.id} className="post-card">
                        <div className="post-header">
                            <img src={post.avatar} alt={post.author} className="avatar" style={{width: 40, height: 40}} />
                            <div style={{flex: 1}}>
                                <div className="author-name">{post.author}</div>
                                <div className="post-meta">{post.time}</div>
                            </div>
                            <button style={{background: 'none', border: 'none', cursor: 'pointer', color: '#5d4037'}}>
                                <MoreHorizontal size={20} />
                            </button>
                        </div>

                        <div className="post-content">
                            {post.content}
                        </div>

                        {post.link && (
                            <a href="#" className="link-block">
                                <img src={post.link.img} alt="link cover" className="link-img" />
                                <div className="link-info">
                                    <div className="link-title">{post.link.title}</div>
                                    <div className="link-source">{post.link.source}</div>
                                </div>
                            </a>
                        )}

                        <div className="action-bar">
                            <button 
                                className={`action-btn ${post.isLiked ? 'active' : ''}`}
                                onClick={() => handleLike(post.id)}
                            >
                                <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} /> 
                                {post.isLiked ? "Đã thích" : "Tán thưởng"} ({post.likes})
                            </button>
                            <button className="action-btn" onClick={() => toggleComments(post.id)}>
                                <MessageCircle size={18} /> Đàm đạo
                            </button>
                            <button className="action-btn">
                                <Share2 size={18} /> Chia sẻ
                            </button>
                        </div>

                        {post.showComments && (
                            <div className="comments-container">
                                {post.comments.map(c => (
                                    <div key={c.id} className="comment-item">
                                        <img 
                                            src={`https://ui-avatars.com/api/?name=${c.author}&background=dccbb5&color=2c1e1a`} 
                                            className="avatar" 
                                            style={{width: 32, height: 32}} 
                                            alt=""
                                        />
                                        <div className="comment-bubble">
                                            <span className="comment-author">{c.author}</span>
                                            <span style={{fontSize: '0.95rem'}}>{c.text}</span>
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="comment-input-wrapper">
                                    <img 
                                        src="https://ui-avatars.com/api/?name=User&background=9a2a2a&color=fff" 
                                        className="avatar" 
                                        style={{width: 32, height: 32}} 
                                        alt=""
                                    />
                                    <input 
                                        type="text" 
                                        className="comment-input" 
                                        placeholder="Viết lời bình..."
                                        value={inputVal}
                                        onChange={(e) => setInputVal(e.target.value)}
                                    />
                                    <button style={{background: 'none', border: 'none', color: '#9a2a2a', cursor: 'pointer'}}>
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </div>
    );
};

export default CommunityPage;