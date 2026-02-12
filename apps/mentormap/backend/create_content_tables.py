#!/usr/bin/env python3
"""
Create content management tables
"""
import sqlite3
import os
from datetime import datetime, timedelta

def create_content_tables():
    """Create content management tables and sample data"""
    db_path = "mentormap.db"
    
    if not os.path.exists(db_path):
        print(f"❌ Database file {db_path} not found")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Create blog_posts table
        print("📝 Creating blog_posts table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS blog_posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                excerpt TEXT,
                content TEXT NOT NULL,
                featured_image TEXT,
                status TEXT DEFAULT 'draft',
                category TEXT,
                tags TEXT,
                author_id INTEGER,
                published_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                meta_title TEXT,
                meta_description TEXT,
                view_count INTEGER DEFAULT 0,
                like_count INTEGER DEFAULT 0,
                share_count INTEGER DEFAULT 0,
                FOREIGN KEY (author_id) REFERENCES users (id)
            )
        """)
        print("   ✅ Created blog_posts table")
        
        # Create resources table
        print("📚 Creating resources table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS resources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                resource_type TEXT NOT NULL,
                category TEXT,
                tags TEXT,
                file_url TEXT,
                external_url TEXT,
                thumbnail TEXT,
                file_size INTEGER,
                file_format TEXT,
                access_level TEXT DEFAULT 'public',
                download_count INTEGER DEFAULT 0,
                rating REAL DEFAULT 0.0,
                rating_count INTEGER DEFAULT 0,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                duration INTEGER,
                page_count INTEGER,
                difficulty_level TEXT,
                FOREIGN KEY (created_by) REFERENCES users (id)
            )
        """)
        print("   ✅ Created resources table")
        
        # Create faqs table
        print("❓ Creating faqs table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS faqs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                category TEXT NOT NULL,
                subcategory TEXT,
                tags TEXT,
                is_featured BOOLEAN DEFAULT 0,
                display_order INTEGER DEFAULT 0,
                status TEXT DEFAULT 'published',
                helpful_count INTEGER DEFAULT 0,
                not_helpful_count INTEGER DEFAULT 0,
                view_count INTEGER DEFAULT 0,
                created_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users (id)
            )
        """)
        print("   ✅ Created faqs table")
        
        # Create testimonials table
        print("⭐ Creating testimonials table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS testimonials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                title TEXT,
                company TEXT,
                email TEXT,
                content TEXT NOT NULL,
                rating INTEGER,
                avatar TEXT,
                status TEXT DEFAULT 'pending',
                is_featured BOOLEAN DEFAULT 0,
                display_order INTEGER DEFAULT 0,
                category TEXT,
                source TEXT,
                location TEXT,
                linkedin_url TEXT,
                approved_by INTEGER,
                approved_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (approved_by) REFERENCES users (id)
            )
        """)
        print("   ✅ Created testimonials table")
        
        # Create content_analytics table
        print("📊 Creating content_analytics table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS content_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_type TEXT NOT NULL,
                content_id INTEGER NOT NULL,
                event_type TEXT NOT NULL,
                user_id INTEGER,
                session_id TEXT,
                ip_address TEXT,
                user_agent TEXT,
                referrer TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        print("   ✅ Created content_analytics table")
        
        # Insert sample blog posts
        print("📝 Creating sample blog posts...")
        sample_blog_posts = [
            (
                "Getting Started with Mentorship",
                "getting-started-with-mentorship",
                "Learn the fundamentals of effective mentorship and how to make the most of your mentoring relationships.",
                """
                <h2>Introduction to Mentorship</h2>
                <p>Mentorship is a powerful tool for personal and professional development. Whether you're a mentor or mentee, understanding the fundamentals can help you build meaningful relationships that drive growth and success.</p>
                
                <h3>What Makes a Great Mentor?</h3>
                <p>Great mentors possess several key qualities:</p>
                <ul>
                    <li><strong>Active Listening:</strong> They listen more than they speak</li>
                    <li><strong>Empathy:</strong> They understand and relate to their mentee's challenges</li>
                    <li><strong>Experience:</strong> They have relevant knowledge to share</li>
                    <li><strong>Patience:</strong> They allow mentees to learn at their own pace</li>
                </ul>
                
                <h3>Setting Clear Expectations</h3>
                <p>Successful mentoring relationships start with clear expectations. Both parties should discuss:</p>
                <ul>
                    <li>Goals and objectives</li>
                    <li>Meeting frequency and format</li>
                    <li>Communication preferences</li>
                    <li>Boundaries and limitations</li>
                </ul>
                
                <h3>Making the Most of Your Sessions</h3>
                <p>To maximize the value of mentoring sessions:</p>
                <ol>
                    <li>Come prepared with specific questions</li>
                    <li>Be open to feedback and constructive criticism</li>
                    <li>Take notes and follow up on action items</li>
                    <li>Show appreciation for your mentor's time</li>
                </ol>
                
                <p>Remember, mentorship is a two-way street. Both mentors and mentees can learn and grow from the relationship.</p>
                """,
                "/images/blog/mentorship-guide.jpg",
                "published",
                "Career Development",
                "mentorship,career,development,guidance",
                1,
                "2024-12-15 10:00:00",
                "Getting Started with Mentorship - Complete Guide",
                "Learn the fundamentals of effective mentorship and how to make the most of your mentoring relationships. Tips for both mentors and mentees.",
                245,
                18,
                12
            ),
            (
                "5 Essential Skills Every Professional Needs",
                "5-essential-skills-every-professional-needs",
                "Discover the top 5 skills that can accelerate your career growth and make you stand out in today's competitive job market.",
                """
                <h2>The Skills That Matter Most</h2>
                <p>In today's rapidly evolving workplace, certain skills have become essential for professional success. Here are the top 5 skills every professional should develop:</p>
                
                <h3>1. Communication Skills</h3>
                <p>Effective communication is the foundation of professional success. This includes:</p>
                <ul>
                    <li>Clear written communication</li>
                    <li>Confident public speaking</li>
                    <li>Active listening</li>
                    <li>Non-verbal communication awareness</li>
                </ul>
                
                <h3>2. Critical Thinking and Problem Solving</h3>
                <p>The ability to analyze complex situations and develop creative solutions is invaluable. Key aspects include:</p>
                <ul>
                    <li>Analytical thinking</li>
                    <li>Creative problem-solving</li>
                    <li>Decision-making under pressure</li>
                    <li>Strategic planning</li>
                </ul>
                
                <h3>3. Adaptability and Learning Agility</h3>
                <p>With constant change in technology and business practices, professionals must be able to:</p>
                <ul>
                    <li>Learn new skills quickly</li>
                    <li>Adapt to changing circumstances</li>
                    <li>Embrace new technologies</li>
                    <li>Stay curious and open-minded</li>
                </ul>
                
                <h3>4. Leadership and Teamwork</h3>
                <p>Whether you're leading a team or contributing as a member, these skills are crucial:</p>
                <ul>
                    <li>Collaborative mindset</li>
                    <li>Conflict resolution</li>
                    <li>Delegation and empowerment</li>
                    <li>Emotional intelligence</li>
                </ul>
                
                <h3>5. Digital Literacy</h3>
                <p>In our digital age, professionals need to be comfortable with:</p>
                <ul>
                    <li>Common software applications</li>
                    <li>Data analysis tools</li>
                    <li>Social media and online presence</li>
                    <li>Cybersecurity awareness</li>
                </ul>
                
                <h3>Developing These Skills</h3>
                <p>To develop these essential skills:</p>
                <ol>
                    <li>Seek feedback from colleagues and supervisors</li>
                    <li>Take online courses and attend workshops</li>
                    <li>Practice in real-world situations</li>
                    <li>Find a mentor who excels in these areas</li>
                    <li>Join professional organizations and networks</li>
                </ol>
                
                <p>Remember, skill development is an ongoing process. Stay committed to continuous learning and improvement.</p>
                """,
                "/images/blog/professional-skills.jpg",
                "published",
                "Professional Development",
                "skills,career,professional,development,workplace",
                1,
                "2024-12-10 14:30:00",
                "5 Essential Skills Every Professional Needs in 2024",
                "Discover the top 5 skills that can accelerate your career growth and make you stand out in today's competitive job market.",
                189,
                24,
                8
            ),
            (
                "The Future of Remote Work and Mentorship",
                "future-of-remote-work-and-mentorship",
                "Explore how remote work is changing the landscape of professional mentorship and what it means for the future.",
                """
                <h2>Remote Work Revolution</h2>
                <p>The shift to remote work has fundamentally changed how we approach professional relationships, including mentorship. This transformation brings both opportunities and challenges.</p>
                
                <h3>Advantages of Remote Mentorship</h3>
                <p>Remote mentorship offers several unique benefits:</p>
                <ul>
                    <li><strong>Global Reach:</strong> Connect with mentors worldwide</li>
                    <li><strong>Flexibility:</strong> Schedule sessions around busy calendars</li>
                    <li><strong>Cost-Effective:</strong> No travel expenses or venue costs</li>
                    <li><strong>Digital Tools:</strong> Leverage technology for enhanced collaboration</li>
                </ul>
                
                <h3>Challenges to Overcome</h3>
                <p>However, remote mentorship also presents challenges:</p>
                <ul>
                    <li>Building personal connections without face-to-face interaction</li>
                    <li>Managing time zones and scheduling conflicts</li>
                    <li>Ensuring effective communication through digital channels</li>
                    <li>Maintaining engagement and accountability</li>
                </ul>
                
                <h3>Best Practices for Remote Mentorship</h3>
                <p>To succeed in remote mentorship:</p>
                <ol>
                    <li><strong>Use Video Calls:</strong> Face-to-face interaction builds stronger relationships</li>
                    <li><strong>Set Clear Boundaries:</strong> Establish communication protocols and response times</li>
                    <li><strong>Leverage Technology:</strong> Use collaboration tools, shared documents, and project management platforms</li>
                    <li><strong>Be Intentional:</strong> Plan structured sessions with clear agendas</li>
                    <li><strong>Stay Connected:</strong> Regular check-ins beyond formal sessions</li>
                </ol>
                
                <h3>The Future Landscape</h3>
                <p>Looking ahead, we can expect:</p>
                <ul>
                    <li>Hybrid mentorship models combining in-person and remote interactions</li>
                    <li>AI-powered matching systems for better mentor-mentee pairings</li>
                    <li>Virtual reality environments for immersive mentoring experiences</li>
                    <li>Micro-mentoring sessions for just-in-time guidance</li>
                </ul>
                
                <p>The future of mentorship is bright, with technology enabling more accessible, flexible, and effective mentoring relationships than ever before.</p>
                """,
                "/images/blog/remote-mentorship.jpg",
                "draft",
                "Future of Work",
                "remote,work,mentorship,future,technology",
                1,
                None,  # published_at
                "The Future of Remote Work and Mentorship",
                "Explore how remote work is changing the landscape of professional mentorship and what it means for the future of career development.",
                0,
                0,
                0
            )
        ]
        
        for post in sample_blog_posts:
            cursor.execute("""
                INSERT OR IGNORE INTO blog_posts 
                (title, slug, excerpt, content, featured_image, status, category, tags, author_id, 
                 published_at, meta_title, meta_description, view_count, like_count, share_count)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, post)
        
        print("   ✅ Created sample blog posts")
        
        # Insert sample resources
        print("📚 Creating sample resources...")
        sample_resources = [
            (
                "Career Development Toolkit",
                "A comprehensive toolkit with templates, worksheets, and guides for career planning and development.",
                "document",
                "Career Development",
                "career,planning,templates,toolkit",
                "/files/resources/career-toolkit.pdf",
                None,
                "/images/resources/career-toolkit-thumb.jpg",
                2048000,  # 2MB
                "pdf",
                "public",
                156,
                4.5,
                32,
                1,
                None,
                45,
                "intermediate"
            ),
            (
                "Leadership Skills Masterclass",
                "A comprehensive video series covering essential leadership skills for modern managers.",
                "video",
                "Leadership",
                "leadership,management,skills,video",
                None,
                "https://example.com/leadership-masterclass",
                "/images/resources/leadership-video-thumb.jpg",
                None,
                "mp4",
                "premium",
                89,
                4.8,
                18,
                1,
                3600,  # 1 hour
                None,
                "advanced"
            ),
            (
                "Networking Templates Collection",
                "Ready-to-use email templates and scripts for professional networking and relationship building.",
                "template",
                "Networking",
                "networking,templates,email,scripts",
                "/files/resources/networking-templates.zip",
                None,
                "/images/resources/networking-templates-thumb.jpg",
                512000,  # 512KB
                "zip",
                "public",
                203,
                4.2,
                41,
                1,
                None,
                None,
                "beginner"
            ),
            (
                "Interview Preparation Guide",
                "Complete guide with common interview questions, preparation strategies, and follow-up tips.",
                "document",
                "Job Search",
                "interview,preparation,job,search",
                "/files/resources/interview-guide.pdf",
                None,
                "/images/resources/interview-guide-thumb.jpg",
                1536000,  # 1.5MB
                "pdf",
                "public",
                312,
                4.6,
                67,
                1,
                None,
                28,
                "beginner"
            ),
            (
                "Project Management Tools Comparison",
                "Interactive tool to compare different project management software and find the best fit for your team.",
                "tool",
                "Project Management",
                "project,management,tools,comparison",
                None,
                "https://tools.example.com/pm-comparison",
                "/images/resources/pm-tools-thumb.jpg",
                None,
                "web",
                "public",
                78,
                4.3,
                15,
                1,
                None,
                None,
                "intermediate"
            )
        ]
        
        for resource in sample_resources:
            cursor.execute("""
                INSERT OR IGNORE INTO resources 
                (title, description, resource_type, category, tags, file_url, external_url, 
                 thumbnail, file_size, file_format, access_level, download_count, rating, 
                 rating_count, created_by, duration, page_count, difficulty_level)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, resource)
        
        print("   ✅ Created sample resources")
        
        # Insert sample FAQs
        print("❓ Creating sample FAQs...")
        sample_faqs = [
            (
                "How do I find the right mentor for my career goals?",
                """Finding the right mentor involves several key steps:

1. **Define Your Goals**: Be clear about what you want to achieve through mentorship
2. **Identify Your Needs**: Determine what type of guidance you need (technical skills, leadership, industry knowledge, etc.)
3. **Research Potential Mentors**: Look for professionals who have achieved what you aspire to
4. **Consider Compatibility**: Think about communication styles, availability, and personality fit
5. **Start with Your Network**: Often the best mentors are people you already know or can be introduced to
6. **Use Professional Platforms**: Leverage LinkedIn, industry associations, and mentorship platforms
7. **Be Specific in Your Approach**: When reaching out, be clear about what you're looking for and what you can offer in return

Remember, mentorship is a two-way relationship. Be prepared to contribute value to your mentor as well.""",
                "Getting Started",
                "Finding Mentors",
                "mentor,career,goals,networking",
                1,
                1,
                "published",
                45,
                3,
                128,
                1
            ),
            (
                "What should I expect from my first mentoring session?",
                """Your first mentoring session is an important foundation-setting meeting. Here's what to expect:

**Before the Session:**
- Your mentor may send you a brief questionnaire or ask you to prepare specific topics
- You should prepare questions and think about your goals

**During the Session:**
- Introductions and background sharing (15-20 minutes)
- Discussion of your career goals and challenges (20-30 minutes)
- Setting expectations for the mentoring relationship (10-15 minutes)
- Scheduling future sessions and communication preferences (5-10 minutes)

**Key Topics to Cover:**
- Your current role and career aspirations
- Specific areas where you'd like guidance
- How often you'll meet and preferred communication methods
- Boundaries and expectations for both parties
- Success metrics for the mentoring relationship

**After the Session:**
- Send a thank-you note summarizing key points discussed
- Complete any action items agreed upon
- Schedule your next session

Remember, it's normal to feel nervous. Your mentor wants to help you succeed!""",
                "Getting Started",
                "First Session",
                "first,session,expectations,preparation",
                1,
                2,
                "published",
                38,
                2,
                95,
                1
            ),
            (
                "How often should I meet with my mentor?",
                """The frequency of mentoring sessions depends on several factors:

**Typical Meeting Frequencies:**
- **Weekly**: For intensive skill development or during critical career transitions
- **Bi-weekly**: Most common frequency for ongoing career development
- **Monthly**: Good for long-term strategic guidance and relationship maintenance
- **Quarterly**: Suitable for senior-level strategic mentoring

**Factors to Consider:**
- **Your Goals**: Urgent goals may require more frequent meetings
- **Mentor's Availability**: Respect your mentor's time constraints
- **Stage of Relationship**: New relationships might benefit from more frequent contact initially
- **Type of Mentoring**: Skill-based mentoring might need more frequent sessions than strategic career guidance

**Best Practices:**
- Start with a higher frequency and adjust as needed
- Be consistent with your schedule
- Prepare thoroughly for each session to maximize value
- Supplement formal sessions with brief check-ins via email or messaging
- Be flexible and adjust frequency based on changing needs

**Quality Over Quantity:**
Remember, it's better to have fewer, well-prepared sessions than frequent meetings without clear objectives.""",
                "Session Management",
                "Frequency",
                "frequency,meetings,schedule,planning",
                0,
                3,
                "published",
                29,
                1,
                87,
                1
            ),
            (
                "What if my mentor and I aren't a good fit?",
                """It's not uncommon for mentor-mentee relationships to not work out perfectly. Here's how to handle this situation:

**Signs of a Poor Fit:**
- Consistently cancelled or rescheduled meetings
- Lack of engagement or preparation from either party
- Communication style differences that can't be bridged
- Conflicting values or approaches
- Mentor lacks relevant experience for your goals
- Personality clash that affects the relationship

**Steps to Take:**

1. **Reflect First**: Consider if the issues are temporary or fundamental
2. **Communicate Openly**: Discuss concerns with your mentor - they may be unaware
3. **Try Adjustments**: Modify meeting format, frequency, or focus areas
4. **Give It Time**: Some relationships need time to develop
5. **Seek Mediation**: If using a formal program, involve the coordinator

**When to End the Relationship:**
- After genuine attempts to improve the situation
- When the relationship becomes counterproductive
- If there are ethical concerns or inappropriate behavior
- When your needs have evolved beyond what the mentor can provide

**How to End Gracefully:**
- Be honest but respectful about the mismatch
- Thank them for their time and any insights gained
- Offer to provide feedback to help them with future mentees
- Leave the door open for potential future interactions

**Moving Forward:**
- Reflect on what you learned about your mentoring needs
- Use this experience to find a better-matched mentor
- Don't let one poor experience discourage you from seeking mentorship

Remember, finding the right mentor sometimes takes a few tries, and that's perfectly normal.""",
                "Relationship Management",
                "Compatibility Issues",
                "compatibility,fit,relationship,issues",
                1,
                4,
                "published",
                22,
                5,
                76,
                1
            ),
            (
                "How do I prepare for mentoring sessions?",
                """Proper preparation is key to getting maximum value from your mentoring sessions:

**Before Each Session:**

1. **Review Previous Session Notes**
   - What action items did you commit to?
   - What progress have you made?
   - What challenges did you encounter?

2. **Prepare Specific Questions**
   - Focus on 2-3 key topics or challenges
   - Avoid vague questions like "What should I do?"
   - Instead ask: "I'm considering X and Y approaches to this problem. What are your thoughts?"

3. **Gather Relevant Materials**
   - Performance reviews, project updates, or work samples
   - Industry articles or trends you want to discuss
   - Any documents that provide context

4. **Set Clear Objectives**
   - What do you want to accomplish in this session?
   - What decisions do you need help making?
   - What skills do you want to develop?

**Sample Preparation Template:**
- **Progress Update**: What I've accomplished since our last meeting
- **Current Challenges**: Specific obstacles I'm facing
- **Questions for Discussion**: 2-3 focused questions
- **Goals for This Session**: What I hope to achieve
- **Action Items**: What I plan to work on next

**During the Session:**
- Take notes on key insights and advice
- Ask follow-up questions for clarity
- Be open about challenges and failures
- Discuss next steps and timelines

**After the Session:**
- Send a summary of key takeaways and action items
- Schedule your next meeting
- Begin working on agreed-upon tasks

**Pro Tips:**
- Send your agenda 24-48 hours before the meeting
- Be punctual and respect time limits
- Come with a learning mindset, not just seeking validation
- Be prepared to discuss both successes and failures""",
                "Session Management",
                "Preparation",
                "preparation,sessions,planning,agenda",
                1,
                5,
                "published",
                67,
                1,
                142,
                1
            ),
            (
                "Can I have multiple mentors at the same time?",
                """Yes, having multiple mentors can be very beneficial! Here's how to manage multiple mentoring relationships effectively:

**Benefits of Multiple Mentors:**
- **Diverse Perspectives**: Different viewpoints on similar challenges
- **Specialized Expertise**: Each mentor can focus on their area of strength
- **Broader Network**: Access to multiple professional networks
- **Reduced Dependency**: Less pressure on any single relationship
- **Comprehensive Development**: Address different aspects of your career simultaneously

**Types of Multiple Mentor Arrangements:**

1. **Functional Mentors**: Different mentors for different skills (technical, leadership, industry knowledge)
2. **Hierarchical Mentors**: Mentors at different career levels
3. **Peer Mentors**: Colleagues at similar levels for mutual support
4. **Reverse Mentors**: Junior colleagues who can teach you new skills (especially technology)

**Best Practices:**

**Be Transparent**
- Let each mentor know you have other mentoring relationships
- Explain how their expertise fits into your overall development plan

**Avoid Conflicts**
- Don't pit mentors against each other
- If you receive conflicting advice, discuss it openly with each mentor

**Manage Your Time**
- Be realistic about how many relationships you can maintain effectively
- Quality is more important than quantity

**Organize Your Approach**
- Keep separate notes for each relationship
- Have clear objectives for each mentoring relationship
- Avoid overwhelming yourself with too many meetings

**Typical Arrangements:**
- **2-3 mentors**: Most manageable for most people
- **Primary + Secondary**: One main mentor plus 1-2 specialized mentors
- **Mentoring Circle**: Group of 3-4 people who mentor each other

**When Multiple Mentors Might Not Work:**
- If you're new to mentoring and still learning how to be a good mentee
- When you have limited time to invest in relationships
- If the mentors have conflicting philosophies that confuse rather than enlighten

Remember, the goal is to create a personal board of advisors who can help you achieve your career objectives.""",
                "Relationship Management",
                "Multiple Mentors",
                "multiple,mentors,relationships,management",
                0,
                6,
                "published",
                34,
                2,
                98,
                1
            )
        ]
        
        for faq in sample_faqs:
            cursor.execute("""
                INSERT OR IGNORE INTO faqs 
                (question, answer, category, subcategory, tags, is_featured, display_order, 
                 status, helpful_count, not_helpful_count, view_count, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, faq)
        
        print("   ✅ Created sample FAQs")
        
        # Insert sample testimonials
        print("⭐ Creating sample testimonials...")
        sample_testimonials = [
            (
                "Sarah Johnson",
                "Senior Software Engineer",
                "TechCorp Inc.",
                "sarah.johnson@techcorp.com",
                "MentorMap completely transformed my career trajectory. My mentor helped me navigate a difficult transition from individual contributor to team lead. The structured approach and regular check-ins kept me accountable and focused on my goals. I can't recommend this platform enough!",
                5,
                "/images/avatars/sarah-johnson.jpg",
                "approved",
                1,
                1,
                "Career Transition",
                "platform",
                "San Francisco, CA",
                "https://linkedin.com/in/sarahjohnson",
                1,
                "2024-12-01 10:00:00"
            ),
            (
                "Michael Chen",
                "Product Manager",
                "StartupXYZ",
                "michael.chen@startupxyz.com",
                "As a first-time product manager, I was overwhelmed with the responsibilities. My mentor on MentorMap provided invaluable guidance on prioritization, stakeholder management, and product strategy. The flexibility of virtual sessions made it easy to fit mentoring into my busy schedule.",
                5,
                "/images/avatars/michael-chen.jpg",
                "approved",
                1,
                2,
                "Professional Development",
                "platform",
                "New York, NY",
                "https://linkedin.com/in/michaelchen",
                1,
                "2024-11-28 14:30:00"
            ),
            (
                "Emily Rodriguez",
                "Marketing Director",
                "Global Marketing Solutions",
                "emily.rodriguez@gms.com",
                "The quality of mentors on MentorMap is exceptional. My mentor had exactly the experience I needed - scaling marketing teams in high-growth companies. The structured goal-setting process helped me stay focused, and I achieved my promotion to Director within 8 months of starting the program.",
                5,
                "/images/avatars/emily-rodriguez.jpg",
                "approved",
                1,
                3,
                "Leadership",
                "platform",
                "Austin, TX",
                "https://linkedin.com/in/emilyrodriguez",
                1,
                "2024-11-25 09:15:00"
            ),
            (
                "David Thompson",
                "Data Scientist",
                "Analytics Pro",
                "david.thompson@analyticspro.com",
                "I was stuck in my career and didn't know how to break into senior roles. My MentorMap mentor helped me identify skill gaps, build a learning plan, and most importantly, develop the confidence to pursue stretch opportunities. The investment in mentoring paid off when I landed my dream job!",
                4,
                "/images/avatars/david-thompson.jpg",
                "approved",
                0,
                4,
                "Career Growth",
                "platform",
                "Seattle, WA",
                "https://linkedin.com/in/davidthompson",
                1,
                "2024-11-20 16:45:00"
            ),
            (
                "Lisa Wang",
                "UX Designer",
                "Design Studio Co.",
                "lisa.wang@designstudio.com",
                "MentorMap made mentorship accessible and structured. As someone who was hesitant to reach out for help, the platform made it easy to connect with experienced professionals. My mentor's feedback on my portfolio and interview skills was instrumental in landing my current role.",
                5,
                "/images/avatars/lisa-wang.jpg",
                "approved",
                1,
                5,
                "Skill Development",
                "platform",
                "Los Angeles, CA",
                "https://linkedin.com/in/lisawang",
                1,
                "2024-11-18 11:20:00"
            ),
            (
                "James Miller",
                "Operations Manager",
                "Manufacturing Plus",
                "james.miller@mfgplus.com",
                "The mentoring experience exceeded my expectations. My mentor's industry knowledge and practical advice helped me streamline our operations and improve team efficiency by 30%. The regular sessions kept me accountable and motivated to implement changes.",
                4,
                "/images/avatars/james-miller.jpg",
                "pending",
                0,
                0,
                "Operations",
                "email",
                "Chicago, IL",
                "https://linkedin.com/in/jamesmiller",
                None,  # approved_by
                None   # approved_at
            )
        ]
        
        for testimonial in sample_testimonials:
            cursor.execute("""
                INSERT OR IGNORE INTO testimonials 
                (name, title, company, email, content, rating, avatar, status, is_featured, 
                 display_order, category, source, location, linkedin_url, approved_by, approved_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, testimonial)
        
        print("   ✅ Created sample testimonials")
        
        # Insert sample content analytics
        print("📊 Creating sample content analytics...")
        sample_analytics = [
            ("blog_post", 1, "view", 1, "session_123", "192.168.1.1", "Mozilla/5.0", "https://google.com"),
            ("blog_post", 1, "like", 1, "session_123", "192.168.1.1", "Mozilla/5.0", None),
            ("blog_post", 2, "view", 2, "session_456", "192.168.1.2", "Mozilla/5.0", "https://linkedin.com"),
            ("resource", 1, "download", 1, "session_789", "192.168.1.3", "Mozilla/5.0", None),
            ("resource", 2, "view", 2, "session_101", "192.168.1.4", "Mozilla/5.0", "https://twitter.com"),
            ("faq", 1, "view", 3, "session_112", "192.168.1.5", "Mozilla/5.0", None),
            ("faq", 1, "helpful", 3, "session_112", "192.168.1.5", "Mozilla/5.0", None)
        ]
        
        for analytics in sample_analytics:
            cursor.execute("""
                INSERT OR IGNORE INTO content_analytics 
                (content_type, content_id, event_type, user_id, session_id, ip_address, user_agent, referrer)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, analytics)
        
        print("   ✅ Created sample content analytics")
        
        conn.commit()
        
        # Show summary
        print("\n📊 Content Management System Summary:")
        cursor.execute("SELECT COUNT(*) FROM blog_posts")
        blog_count = cursor.fetchone()[0]
        print(f"   - Blog Posts: {blog_count}")
        
        cursor.execute("SELECT COUNT(*) FROM resources")
        resource_count = cursor.fetchone()[0]
        print(f"   - Resources: {resource_count}")
        
        cursor.execute("SELECT COUNT(*) FROM faqs")
        faq_count = cursor.fetchone()[0]
        print(f"   - FAQs: {faq_count}")
        
        cursor.execute("SELECT COUNT(*) FROM testimonials")
        testimonial_count = cursor.fetchone()[0]
        print(f"   - Testimonials: {testimonial_count}")
        
        cursor.execute("SELECT COUNT(*) FROM content_analytics")
        analytics_count = cursor.fetchone()[0]
        print(f"   - Analytics Events: {analytics_count}")
        
        print("\n✅ Content management system created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating content tables: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    create_content_tables()