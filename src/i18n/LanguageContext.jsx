import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const SETTINGS_KEY = "learnflow_settings";
const LANGUAGE_EVENT = "learnflow:language-change";

const km = {
  "Home": "ទំព័រដើម", "My Lessons": "មេរៀនរបស់ខ្ញុំ", "Lessons": "មេរៀន", "Projects": "គម្រោង", "Calendar": "ប្រតិទិន",
  "My Profile": "ប្រវត្តិរូបរបស់ខ្ញុំ", "Exam Test": "ការប្រឡង", "Settings": "ការកំណត់",
  "Notifications": "ការជូនដំណឹង", "View all notifications": "មើលការជូនដំណឹងទាំងអស់", "Mark all as read": "សម្គាល់ថាបានអានទាំងអស់",
  "No notifications yet": "មិនទាន់មានការជូនដំណឹង", "Logout": "ចាកចេញ", "Login": "ចូលគណនី", "Sign Up": "ចុះឈ្មោះ",
  "Profile": "ប្រវត្តិរូប", "Skills": "ជំនាញ", "Security": "សុវត្ថិភាព", "Account": "គណនី",
  "Edit Profile": "កែសម្រួលប្រវត្តិរូប", "Save Changes": "រក្សាទុកការផ្លាស់ប្តូរ", "Saving...": "កំពុងរក្សាទុក...",
  "Cancel": "បោះបង់", "Personal Information": "ព័ត៌មានផ្ទាល់ខ្លួន", "Social & Web": "បណ្ដាញសង្គម និងគេហទំព័រ",
  "Full Name": "ឈ្មោះពេញ", "Email": "អ៊ីមែល", "Email Address": "អាសយដ្ឋានអ៊ីមែល", "Phone": "លេខទូរស័ព្ទ",
  "Location": "ទីតាំង", "Occupation": "មុខរបរ", "Education": "ការអប់រំ", "Bio": "ប្រវត្តិសង្ខេប",
  "Student": "សិស្ស", "Achievements": "សមិទ្ធផល", "Languages": "ភាសា", "Courses": "វគ្គសិក្សា",
  "Certificates": "វិញ្ញាបនបត្រ", "No languages saved yet.": "មិនទាន់បានរក្សាទុកភាសាទេ។", "Not connected": "មិនទាន់បានភ្ជាប់",
  "Manage your personal information, avatar, and projects": "គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួន រូបតំណាង និងគម្រោងរបស់អ្នក",
  "Password & security": "ពាក្យសម្ងាត់ និងសុវត្ថិភាព", "Reset Password": "កំណត់ពាក្យសម្ងាត់ឡើងវិញ",
  "Language & Region": "ភាសា និងតំបន់", "Set your locale preferences": "កំណត់ចំណូលចិត្តភាសា និងតំបន់របស់អ្នក",
  "Language": "ភាសា", "Timezone": "តំបន់ពេលវេលា", "Date Format": "ទម្រង់កាលបរិច្ឆេទ", "Time Format": "ទម្រង់ម៉ោង",
  "Currency": "រូបិយប័ណ្ណ", "English (US)": "អង់គ្លេស (សហរដ្ឋអាមេរិក)", "Save": "រក្សាទុក",
  "Appearance": "រូបរាង", "Privacy": "ភាពឯកជន", "Payment": "ការទូទាត់", "Accessibility": "ភាពងាយស្រួលប្រើប្រាស់",
  "Light": "ភ្លឺ", "Dark": "ងងឹត", "System": "តាមប្រព័ន្ធ", "Font Size": "ទំហំអក្សរ", "Font Family": "ប្រភេទពុម្ពអក្សរ",
  "Live Preview": "មើលជាមុន", "Compact View": "ទិដ្ឋភាពបង្រួម", "Reduce Animations": "កាត់បន្ថយចលនា", "High Contrast": "កម្រិតពណ៌ខ្ពស់",
  "Expand Your Knowledge": "ពង្រីកចំណេះដឹងរបស់អ្នក", "Search lessons...": "ស្វែងរកមេរៀន...", "Search": "ស្វែងរក",
  "All": "ទាំងអស់", "Networking": "បណ្ដាញ", "Web": "គេហទំព័រ", "Database": "មូលដ្ឋានទិន្នន័យ", "English": "ភាសាអង់គ្លេស",
  "Mobile": "ទូរស័ព្ទ", "Engineering": "វិស្វកម្ម", "All Levels": "គ្រប់កម្រិត", "Free Preview Mode": "របៀបមើលជាមុនឥតគិតថ្លៃ",
  "Unlock All →": "ដោះសោទាំងអស់ →", "Unlock Full Access": "ដោះសោការចូលប្រើពេញលេញ", "Subscribe Now →": "ជាវឥឡូវនេះ →",
  "Card Number": "លេខកាត", "Expiry Date": "ថ្ងៃផុតកំណត់", "Secure 256-bit SSL encryption": "ការពារដោយការអ៊ិនគ្រីប SSL 256-bit",
  "Submit": "បញ្ជូន", "Next": "បន្ទាប់", "Previous": "មុន", "Start Exam": "ចាប់ផ្ដើមប្រឡង", "Submit Exam": "បញ្ជូនការប្រឡង",
  "Results": "លទ្ធផល", "Question": "សំណួរ", "Questions": "សំណួរ", "Correct": "ត្រឹមត្រូវ", "Incorrect": "មិនត្រឹមត្រូវ",
  "Upcoming": "នាពេលខាងមុខ", "Today": "ថ្ងៃនេះ", "Month": "ខែ", "Week": "សប្ដាហ៍", "Day": "ថ្ងៃ",
  "Add Event": "បន្ថែមព្រឹត្តិការណ៍", "No events": "មិនមានព្រឹត្តិការណ៍", "View Project": "មើលគម្រោង",
  "Featured Projects": "គម្រោងពិសេស", "All Projects": "គម្រោងទាំងអស់", "Search projects...": "ស្វែងរកគម្រោង...",
  "Loading...": "កំពុងផ្ទុក...", "Try Again": "ព្យាយាមម្ដងទៀត", "Close": "បិទ", "Delete": "លុប", "Edit": "កែសម្រួល",
  "Learn More": "ស្វែងយល់បន្ថែម", "Get Started": "ចាប់ផ្ដើម", "Explore Courses": "ស្វែងរកវគ្គសិក្សា",
  "Blog": "ប្លុក", "Community": "សហគមន៍", "Privacy Policy": "គោលការណ៍ឯកជនភាព", "Terms of Service": "លក្ខខណ្ឌសេវាកម្ម", "Cookie Policy": "គោលការណ៍ខូគី",
  "All rights reserved.": "រក្សាសិទ្ធិគ្រប់យ៉ាង។", "Made with": "បង្កើតដោយ", "in Cambodia": "នៅកម្ពុជា",
};

Object.assign(km, {
  "Account Settings":"ការកំណត់គណនី", "Profile Settings":"ការកំណត់ប្រវត្តិរូប", "Manage your preferences and account configuration":"គ្រប់គ្រងចំណូលចិត្ត និងការកំណត់គណនីរបស់អ្នក",
  "Password & Security":"ពាក្យសម្ងាត់ និងសុវត្ថិភាព", "Log out of your account":"ចាកចេញពីគណនីរបស់អ្នក", "Sign Out":"ចាកចេញ", "Sign out":"ចាកចេញ",
  "Notification filters":"តម្រងការជូនដំណឹង", "Mark all read":"សម្គាល់ថាបានអានទាំងអស់", "Clear read":"លុបអ្វីដែលបានអាន",
  "New updates will appear here.":"ព័ត៌មានថ្មីនឹងបង្ហាញនៅទីនេះ។", "You’re all caught up":"អ្នកបានអានទាំងអស់ហើយ", "Stay up to date":"ទទួលបានព័ត៌មានថ្មីៗ",
  "Lessons, achievements, and important deadlines in one place.":"មេរៀន សមិទ្ធផល និងកាលកំណត់សំខាន់ៗនៅកន្លែងតែមួយ។",
  "About EduLearn":"អំពី EduLearn", "Quick Links":"តំណភ្ជាប់រហ័ស", "Resources":"ធនធាន", "Connect With Us":"ភ្ជាប់ជាមួយយើង",
  "Empowering learners worldwide with quality education, expert-led courses, and a supportive community. Join us in shaping the future of learning.":"ផ្តល់អំណាចដល់អ្នកសិក្សាទូទាំងពិភពលោកតាមរយៈការអប់រំប្រកបដោយគុណភាព វគ្គសិក្សាដឹកនាំដោយអ្នកជំនាញ និងសហគមន៍គាំទ្រ។",
  "EduLearn is a next-generation online education platform that combines expert instruction, community, and technology to help you grow your career and knowledge — on your schedule.":"EduLearn ជាវេទិកាអប់រំអនឡាញជំនាន់ថ្មី ដែលរួមបញ្ចូលការបង្រៀនពីអ្នកជំនាញ សហគមន៍ និងបច្ចេកវិទ្យា ដើម្បីជួយអភិវឌ្ឍអាជីព និងចំណេះដឹងរបស់អ្នក។",
  "EduLearn. All rights reserved.":"EduLearn។ រក្សាសិទ្ធិគ្រប់យ៉ាង។", "Educational Content":"មាតិកាអប់រំ", "Student Login":"ការចូលសម្រាប់សិស្ស",
  "Start Learning Now":"ចាប់ផ្ដើមសិក្សាឥឡូវនេះ", "Browse Free Courses":"រកមើលវគ្គសិក្សាឥតគិតថ្លៃ", "Your future starts today.":"អនាគតរបស់អ្នកចាប់ផ្ដើមថ្ងៃនេះ។",
  "Learn Without":"សិក្សាដោយគ្មាន", "Limits":"ដែនកំណត់", "Built for the":"បង្កើតសម្រាប់", "future of learning":"អនាគតនៃការសិក្សា",
  "Join over":"ចូលរួមជាមួយសិស្សជាង", "worldwide unlocking their potential with expert-led courses, live mentorship, and industry-recognised certificates.":"នាក់ទូទាំងពិភពលោក ដែលកំពុងបញ្ចេញសក្តានុពលតាមរយៈវគ្គសិក្សាពីអ្នកជំនាញ ការណែនាំផ្ទាល់ និងវិញ្ញាបនបត្រទទួលស្គាល់ដោយឧស្សាហកម្ម។",
  "Join thousands of learners who transformed their careers with EduLearn. First course is completely free.":"ចូលរួមជាមួយអ្នកសិក្សារាប់ពាន់នាក់ដែលបានផ្លាស់ប្តូរអាជីពជាមួយ EduLearn។ វគ្គដំបូងឥតគិតថ្លៃទាំងស្រុង។",
  "50,000+ students":"សិស្សជាង 50,000 នាក់", "#1 Online Learning Platform":"វេទិកាសិក្សាអនឡាញលំដាប់លេខ ១",
  "Video lessons organised by year and semester. First":"មេរៀនវីដេអូរៀបចំតាមឆ្នាំ និងឆមាស។ វីដេអូ", "videos free.":"ដំបូងឥតគិតថ្លៃ។",
  "Get unlimited access to all":"ទទួលបានការចូលប្រើដោយគ្មានដែនកំណត់ទៅកាន់វីដេអូទាំង", "+ videos":"+", "/month":"/ខែ",
  "Full lesson access":"ចូលប្រើមេរៀនពេញលេញ", "Click any unlocked video to play":"ចុចវីដេអូដែលបានដោះសោដើម្បីចាក់", "No subjects found":"រកមិនឃើញមុខវិជ្ជា",
  "Search subjects...":"ស្វែងរកមុខវិជ្ជា...", "Loading lessons...":"កំពុងផ្ទុកមេរៀន...", "Failed to load lessons":"មិនអាចផ្ទុកមេរៀនបាន",
  "No video available":"មិនមានវីដេអូ", "This lesson doesn't have a video yet":"មេរៀននេះមិនទាន់មានវីដេអូទេ", "Unable to load video":"មិនអាចផ្ទុកវីដេអូបាន",
  "Loading video...":"កំពុងផ្ទុកវីដេអូ...", "Video Playlist":"បញ្ជីវីដេអូ", "Playlist":"បញ្ជីចាក់", "Press ESC to close":"ចុច ESC ដើម្បីបិទ",
  "Supported formats: YouTube, YouTube Shorts":"ទម្រង់ដែលគាំទ្រ៖ YouTube និង YouTube Shorts", "The video link appears to be invalid or unsupported. Please check the URL and try again.":"តំណវីដេអូនេះមិនត្រឹមត្រូវ ឬមិនត្រូវបានគាំទ្រ។ សូមពិនិត្យតំណ ហើយព្យាយាមម្ដងទៀត។",
  "🔒 Premium":"🔒 ពិសេស", "🔒 Secure playback":"🔒 ការចាក់មានសុវត្ថិភាព", "🎓 Educational purposes only":"🎓 សម្រាប់គោលបំណងអប់រំតែប៉ុណ្ណោះ",
  "My Work":"ស្នាដៃរបស់ខ្ញុំ", "My Projects":"គម្រោងរបស់ខ្ញុំ", "Portfolio Showcase":"ការបង្ហាញស្នាដៃ", "Masterpieces":"ស្នាដៃឆ្នើម",
  "Explore my portfolio of innovative web applications, from AI-powered dashboards to blockchain solutions.":"ស្វែងយល់ពីស្នាដៃកម្មវិធីគេហទំព័រច្នៃប្រឌិតរបស់ខ្ញុំ ចាប់ពីផ្ទាំងគ្រប់គ្រង AI ដល់ដំណោះស្រាយ blockchain។",
  "A collection of projects that showcase my expertise in modern web development.":"បណ្តុំគម្រោងដែលបង្ហាញពីជំនាញរបស់ខ្ញុំក្នុងការអភិវឌ្ឍគេហទំព័រទំនើប។",
  "View All Projects":"មើលគម្រោងទាំងអស់", "No projects yet":"មិនទាន់មានគម្រោង", "Live Demo":"សាកល្បងផ្ទាល់", "Code":"កូដ", "⭐ Featured":"⭐ ពិសេស",
  "Programme":"កម្មវិធីសិក្សា", "Curriculum":"កម្មវិធីសិក្សា", "Subject":"មុខវិជ្ជា", "Year":"ឆ្នាំ", "Credit":"ក្រេឌីត", "credits":"ក្រេឌីត",
  "Hours":"ម៉ោង", "Hours (L-P-S)":"ម៉ោង (L-P-S)", "L = Lecture":"L = ការបង្រៀន", "P = Practice":"P = ការអនុវត្ត", "S = Self Study":"S = សិក្សាដោយខ្លួនឯង",
  "Loading curriculum...":"កំពុងផ្ទុកកម្មវិធីសិក្សា...", "Failed to load curriculum":"មិនអាចផ្ទុកកម្មវិធីសិក្សាបាន", "Refresh":"ផ្ទុកឡើងវិញ",
  "Major not assigned":"មិនទាន់កំណត់ជំនាញ", "Your account does not have a major assigned. Please contact an administrator.":"គណនីរបស់អ្នកមិនទាន់មានជំនាញទេ។ សូមទាក់ទងអ្នកគ្រប់គ្រង។",
  "Exam details":"ព័ត៌មានការប្រឡង", "Exam progress":"ដំណើរការប្រឡង", "Before you start":"មុនពេលចាប់ផ្ដើម", "Ready to start?":"ត្រៀមចាប់ផ្ដើមហើយឬនៅ?",
  "Loading your exam":"កំពុងផ្ទុកការប្រឡងរបស់អ្នក", "Preparing the latest questions for your major.":"កំពុងរៀបចំសំណួរថ្មីបំផុតសម្រាប់ជំនាញរបស់អ្នក។",
  "No questions are available for this major yet. Please check again later.":"មិនទាន់មានសំណួរសម្រាប់ជំនាញនេះទេ។ សូមពិនិត្យម្ដងទៀតនៅពេលក្រោយ។",
  "Total questions":"សំណួរសរុប", "Required answers":"ចម្លើយចាំបាច់", "Passing score":"ពិន្ទុជាប់", "Pass mark":"ពិន្ទុជាប់", "Answered":"បានឆ្លើយ",
  "answered":"បានឆ្លើយ", "submitted":"បានបញ្ជូន", "correct":"ត្រឹមត្រូវ", "This question is required.":"សំណួរនេះចាំបាច់ត្រូវឆ្លើយ។",
  "Complete every required question and submit once. A score of":"ឆ្លើយគ្រប់សំណួរចាំបាច់ ហើយបញ្ជូនតែម្តង។ ពិន្ទុ", "% or higher awards your certificate automatically.":"% ឬខ្ពស់ជាងនេះ នឹងទទួលបានវិញ្ញាបនបត្រដោយស្វ័យប្រវត្តិ។",
  "This exam is formatted like a professional assessment form. Choose one answer for each question, review your responses, then submit for scoring.":"ការប្រឡងនេះរៀបចំដូចទម្រង់វាយតម្លៃវិជ្ជាជីវៈ។ ជ្រើសចម្លើយមួយសម្រាប់សំណួរនីមួយៗ ពិនិត្យឡើងវិញ ហើយបញ្ជូនដើម្បីទទួលពិន្ទុ។",
  "Start exam":"ចាប់ផ្ដើមប្រឡង", "Submit exam":"បញ្ជូនការប្រឡង", "Retake exam":"ប្រឡងម្ដងទៀត", "Retake":"ធ្វើម្ដងទៀត", "Back":"ត្រឡប់ក្រោយ",
  "Next page":"ទំព័របន្ទាប់", "Page":"ទំព័រ", "Score":"ពិន្ទុ", "Auto-save on":"រក្សាទុកស្វ័យប្រវត្តិ", "Try again":"ព្យាយាមម្ដងទៀត", "Retry":"ព្យាយាមឡើងវិញ",
  "Change Avatar":"ប្តូររូបតំណាង", "Change profile picture":"ប្តូររូបប្រវត្តិរូប", "Upload Photo":"ផ្ទុករូបថត", "Update Photo":"ធ្វើបច្ចុប្បន្នភាពរូបថត",
  "Save Photo":"រក្សាទុករូបថត", "Uploading...":"កំពុងផ្ទុក...", "Choose a different image":"ជ្រើសរូបផ្សេង", "Preview your new profile picture":"មើលរូបប្រវត្តិរូបថ្មីជាមុន",
  "JPG, PNG or GIF · Max 2MB":"JPG, PNG ឬ GIF · អតិបរមា 2MB", "No bio added yet.":"មិនទាន់បានបន្ថែមប្រវត្តិសង្ខេបទេ។", "Joined":"បានចូលរួម",
  "Skills & Expertise":"ជំនាញ និងឯកទេស", "No skills added yet.":"មិនទាន់បានបន្ថែមជំនាញទេ។", "Add a skill...":"បន្ថែមជំនាញ...", "Add":"បន្ថែម",
  "New Request":"សំណើថ្មី", "Submit Your First Request":"បញ្ជូនសំណើដំបូងរបស់អ្នក", "Submit a project for teacher review, then admin approval":"បញ្ជូនគម្រោងឱ្យគ្រូពិនិត្យ បន្ទាប់មកឱ្យអ្នកគ្រប់គ្រងអនុម័ត",
  "Project Title *":"ចំណងជើងគម្រោង *", "Description *":"ការពិពណ៌នា *", "Describe your project...":"ពិពណ៌នាអំពីគម្រោងរបស់អ្នក...", "Technologies":"បច្ចេកវិទ្យា",
  "Add technology...":"បន្ថែមបច្ចេកវិទ្យា...", "Project Image URL":"តំណរូបភាពគម្រោង", "GitHub URL":"តំណ GitHub", "Live Demo URL":"តំណសាកល្បងផ្ទាល់",
  "Category":"ប្រភេទ", "Completed Date":"កាលបរិច្ឆេទបញ្ចប់", "Software":"សូហ្វវែរ", "Hardware":"ហាដវែរ", "Data Science":"វិទ្យាសាស្ត្រទិន្នន័យ",
  "Web Development":"ការអភិវឌ្ឍគេហទំព័រ", "Other":"ផ្សេងទៀត", "Submitting":"កំពុងបញ្ជូន", "request":"សំណើ",
  "Your project will be saved as pending and will not appear on the public Projects page until a teacher approves it first, then an admin gives final approval.":"គម្រោងរបស់អ្នកនឹងត្រូវរក្សាទុកជាសំណើរង់ចាំ ហើយមិនបង្ហាញជាសាធារណៈរហូតដល់គ្រូអនុម័តជាមុន និងអ្នកគ្រប់គ្រងអនុម័តចុងក្រោយ។",
  "Payment Settings":"ការកំណត់ការទូទាត់", "Payment Methods":"វិធីទូទាត់", "Billing History":"ប្រវត្តិវិក្កយបត្រ", "+ Add Payment Method":"+ បន្ថែមវិធីទូទាត់",
  "No payment methods saved.":"មិនទាន់បានរក្សាទុកវិធីទូទាត់ទេ។", "No billing history available.":"មិនមានប្រវត្តិវិក្កយបត្រ។", "Expires":"ផុតកំណត់",
  "Small (13px)":"តូច (13px)", "Medium (15px)":"មធ្យម (15px)", "Large (17px)":"ធំ (17px)", "Extra Large (19px)":"ធំបំផុត (19px)",
  "12-hour (AM/PM)":"12 ម៉ោង (AM/PM)", "24-hour":"24 ម៉ោង", "USD — US Dollar":"USD — ដុល្លារអាមេរិក", "KHR — Khmer Riel":"KHR — រៀលខ្មែរ",
  "EUR — Euro":"EUR — អឺរ៉ូ", "GBP — British Pound":"GBP — ផោនអង់គ្លេស", "Processing...":"កំពុងដំណើរការ...",
  "By subscribing, you agree to our Terms of Service and Privacy Policy. You can cancel anytime.":"តាមរយៈការជាវ អ្នកយល់ព្រមនឹងលក្ខខណ្ឌសេវាកម្ម និងគោលការណ៍ឯកជនភាពរបស់យើង។ អ្នកអាចបោះបង់បានគ្រប់ពេល។",
  "Close modal":"បិទផ្ទាំង", "Close subscription dialog":"បិទផ្ទាំងជាវ", "Dismiss error":"បិទសារកំហុស", "Toggle menu":"បើកឬបិទម៉ឺនុយ", "View profile":"មើលប្រវត្តិរូប",
  "200+ Expert Courses":"វគ្គសិក្សាពីអ្នកជំនាញជាង 200", "98% Success Rate":"អត្រាជោគជ័យ 98%", "Success Rate":"អត្រាជោគជ័យ",
  "Expert-led video courses":"វគ្គវីដេអូដឹកនាំដោយអ្នកជំនាញ", "Learn at Your Pace":"សិក្សាតាមល្បឿនរបស់អ្នក", "Start Learning":"ចាប់ផ្ដើមសិក្សា", "Watch Video":"មើលវីដេអូ",
  "Live Mentorship":"ការណែនាំផ្ទាល់", "Live mentorship sessions":"វគ្គណែនាំផ្ទាល់", "Lifetime course access":"ចូលប្រើវគ្គសិក្សាពេញមួយជីវិត", "Industry certificates":"វិញ្ញាបនបត្រឧស្សាហកម្ម",
  "Recognised Certificates":"វិញ្ញាបនបត្រដែលទទួលស្គាល់", "Earn certificates that employers trust. Our credentials are backed by top universities and Fortune 500 partners.":"ទទួលបានវិញ្ញាបនបត្រដែលនិយោជកទុកចិត្ត និងគាំទ្រដោយសាកលវិទ្យាល័យកំពូល និងដៃគូ Fortune 500។",
  "From coding and design to business and creativity — our curriculum is crafted by industry professionals and updated regularly.":"ចាប់ពីការសរសេរកូដ និងការរចនា ដល់អាជីវកម្ម និងភាពច្នៃប្រឌិត—កម្មវិធីសិក្សារបស់យើងរៀបចំដោយអ្នកជំនាញ និងធ្វើបច្ចុប្បន្នភាពជាប្រចាំ។",
  "Get real-time guidance from mentors who've been where you want to go. Weekly office hours, 1-on-1 sessions, and group workshops.":"ទទួលបានការណែនាំភ្លាមៗពីអ្នកណែនាំដែលមានបទពិសោធន៍ ជាមួយវគ្គផ្ទាល់ខ្លួន និងសិក្ខាសាលាជាក្រុម។",
  "Lifetime access to every course you enrol in. Pause, replay, and revisit lessons whenever and wherever you want.":"ចូលប្រើគ្រប់វគ្គដែលអ្នកបានចុះឈ្មោះពេញមួយជីវិត។ ផ្អាក ចាក់ឡើងវិញ និងរៀនម្ដងទៀតគ្រប់ពេលវេលា។",
  "Our structured learning paths and accountability tools ensure you finish what you start and actually apply what you learn.":"ផ្លូវសិក្សាដែលមានរចនាសម្ព័ន្ធ និងឧបករណ៍តាមដានរបស់យើង ជួយឱ្យអ្នកបញ្ចប់ និងអនុវត្តអ្វីដែលបានរៀន។",
  "Help Center":"មជ្ឈមណ្ឌលជំនួយ", "Project Showcase":"ការបង្ហាញគម្រោង", "Admin Review":"ការពិនិត្យរបស់អ្នកគ្រប់គ្រង", "Submit for approval":"បញ្ជូនសុំការអនុម័ត",
  "New Project":"គម្រោងថ្មី", "Edit Project":"កែសម្រួលគម្រោង", "Submit Request":"បញ្ជូនសំណើ", "Update Request":"ធ្វើបច្ចុប្បន្នភាពសំណើ", "Update your request":"កែប្រែសំណើរបស់អ្នក",
  "No description available":"មិនមានការពិពណ៌នា", "Are you sure you want to delete this project?":"តើអ្នកប្រាកដថាចង់លុបគម្រោងនេះមែនទេ?",
  "Could not delete project request.":"មិនអាចលុបសំណើគម្រោងបាន។", "Could not submit project request.":"មិនអាចបញ្ជូនសំណើគម្រោងបាន។",
  "Project deleted successfully!":"បានលុបគម្រោងដោយជោគជ័យ!", "Project request submitted. It will show publicly after teacher and admin approval.":"បានបញ្ជូនសំណើគម្រោង។ វានឹងបង្ហាញជាសាធារណៈបន្ទាប់ពីគ្រូ និងអ្នកគ្រប់គ្រងអនុម័ត។",
  "Project request updated. It will show publicly after approval.":"បានធ្វើបច្ចុប្បន្នភាពសំណើគម្រោង។ វានឹងបង្ហាញជាសាធារណៈបន្ទាប់ពីការអនុម័ត។",
  "Name and email are required.":"ត្រូវការឈ្មោះ និងអ៊ីមែល។", "Please choose a valid image file.":"សូមជ្រើសឯកសាររូបភាពត្រឹមត្រូវ។", "Please choose an image file.":"សូមជ្រើសឯកសាររូបភាព។",
  "Profile images must be smaller than 2 MB.":"រូបប្រវត្តិរូបត្រូវតែតូចជាង 2 MB។", "Profile photo must be smaller than 2MB.":"រូបប្រវត្តិរូបត្រូវតែតូចជាង 2MB។",
  "Profile photo updated!":"បានធ្វើបច្ចុប្បន្នភាពរូបថតប្រវត្តិរូប!", "Profile picture updated!":"បានធ្វើបច្ចុប្បន្នភាពរូបប្រវត្តិរូប!", "Profile updated successfully!":"បានធ្វើបច្ចុប្បន្នភាពប្រវត្តិរូបដោយជោគជ័យ!",
  "Full name is required":"ត្រូវការឈ្មោះពេញ", "Email is required":"ត្រូវការអ៊ីមែល", "Email is invalid":"អ៊ីមែលមិនត្រឹមត្រូវ", "Card number is required":"ត្រូវការលេខកាត",
  "Card number must be 16 digits":"លេខកាតត្រូវមាន 16 ខ្ទង់", "Expiry date is required":"ត្រូវការថ្ងៃផុតកំណត់", "CVV is required":"ត្រូវការ CVV", "CVV must be 3 or 4 digits":"CVV ត្រូវមាន 3 ឬ 4 ខ្ទង់", "Format: MM/YY":"ទម្រង់៖ MM/YY",
  "Theme & display options":"ជម្រើសរូបរាង និងការបង្ហាញ", "Customize your viewing experience":"កែសម្រួលបទពិសោធន៍មើលរបស់អ្នក", "Personal information":"ព័ត៌មានផ្ទាល់ខ្លួន", "Update your personal information":"ធ្វើបច្ចុប្បន្នភាពព័ត៌មានផ្ទាល់ខ្លួន",
  "Billing & methods":"វិក្កយបត្រ និងវិធីទូទាត់", "Manage billing and payment methods":"គ្រប់គ្រងវិក្កយបត្រ និងវិធីទូទាត់", "Billing Address":"អាសយដ្ឋានវិក្កយបត្រ",
  "Locale preferences":"ចំណូលចិត្តភាសា និងតំបន់", "Liquid Glass":"កញ្ចក់រាវ", "Use translucent iOS-style surfaces and background blur":"ប្រើផ្ទៃថ្លាបែប iOS និងព្រិលផ្ទៃខាងក្រោយ",
  "Show more content with reduced spacing":"បង្ហាញមាតិកាច្រើនជាមួយគម្លាតតិច", "Minimize motion effects throughout the site":"កាត់បន្ថយចលនានៅទូទាំងគេហទំព័រ", "Increase contrast for better visibility":"បង្កើនកម្រិតពណ៌ដើម្បីងាយមើល",
  "Automatically renew your subscription each period":"បន្តការជាវដោយស្វ័យប្រវត្តិនៅរាល់រយៈពេល", "Phone Number":"លេខទូរស័ព្ទ", "Phnom Penh, Cambodia":"ភ្នំពេញ កម្ពុជា",
  "First Year":"ឆ្នាំទី ១", "Second Year":"ឆ្នាំទី ២", "Third Year":"ឆ្នាំទី ៣", "Fourth Year":"ឆ្នាំទី ៤", "SEMESTER I":"ឆមាសទី ១", "SEMESTER II":"ឆមាសទី ២",
  "Year 1 Semester 1":"ឆ្នាំទី ១ ឆមាសទី ១", "Year 1 Semester 2":"ឆ្នាំទី ១ ឆមាសទី ២", "Year 2 Semester 1":"ឆ្នាំទី ២ ឆមាសទី ១", "Year 2 Semester 2":"ឆ្នាំទី ២ ឆមាសទី ២",
  "Year 3 Semester 1":"ឆ្នាំទី ៣ ឆមាសទី ១", "Year 3 Semester 2":"ឆ្នាំទី ៣ ឆមាសទី ២", "Year 4 Semester 1":"ឆ្នាំទី ៤ ឆមាសទី ១", "Year 4 Semester 2":"ឆ្នាំទី ៤ ឆមាសទី ២",
  "All questions are answered. Review once before submitting.":"បានឆ្លើយគ្រប់សំណួរ។ សូមពិនិត្យម្ដងទៀតមុនពេលបញ្ជូន។", "Please sign in again before submitting your exam.":"សូមចូលគណនីម្ដងទៀត មុនពេលបញ្ជូនការប្រឡង។",
  "This exam does not have any questions yet.":"ការប្រឡងនេះមិនទាន់មានសំណួរទេ។", "Exam submitted":"បានបញ្ជូនការប្រឡង", "Exam submitted successfully":"បានបញ្ជូនការប្រឡងដោយជោគជ័យ",
  "You passed. Your certificate has been issued and added to your learning record.":"អ្នកបានជាប់។ វិញ្ញាបនបត្ររបស់អ្នកត្រូវបានចេញ និងបន្ថែមទៅកំណត់ត្រាសិក្សា។",
  "Avatar preview":"មើលរូបតំណាងជាមុន", "Elearning Logo":"ឡូហ្គោ Elearning", "EduLearn campus":"បរិវេណ EduLearn", "Curriculum Banner":"ផ្ទាំងកម្មវិធីសិក្សា",
  "January":"មករា", "February":"កុម្ភៈ", "March":"មីនា", "April":"មេសា", "May":"ឧសភា", "June":"មិថុនា",
  "July":"កក្កដា", "August":"សីហា", "September":"កញ្ញា", "October":"តុលា", "November":"វិច្ឆិកា", "December":"ធ្នូ",
  "Monday":"ចន្ទ", "Tuesday":"អង្គារ", "Wednesday":"ពុធ", "Thursday":"ព្រហស្បតិ៍", "Friday":"សុក្រ", "Saturday":"សៅរ៍", "Sunday":"អាទិត្យ",
  "Loading real-time updates…":"កំពុងផ្ទុកព័ត៌មានថ្មីៗ…", "Active":"សកម្ម", "Default":"លំនាំដើម", "First":"ទីមួយ", "Show more":"បង្ហាញបន្ថែម",
  "Foundation":"ឆ្នាំមូលដ្ឋាន", "Foundation Year":"ឆ្នាំមូលដ្ឋាន",
});

const patterns = [
  [/^Get unlimited access to all (\d+)\+ videos$/, (_, n) => `ទទួលបានការចូលប្រើវីដេអូទាំង ${n}+ ដោយគ្មានដែនកំណត់`],
  [/^Watch first (\d+) videos free\. Subscribe to unlock all\.$/, (_, n) => `មើលវីដេអូ ${n} ដំបូងដោយឥតគិតថ្លៃ។ ជាវដើម្បីដោះសោទាំងអស់។`],
  [/^(\d+) subjects$/, (_, n) => `${n} មុខវិជ្ជា`],
  [/^(\d+) questions$/, (_, n) => `${n} សំណួរ`],
  [/^(\d+) videos$/, (_, n) => `${n} វីដេអូ`],
  [/^(\d+) new$/, (_, n) => `${n} ថ្មី`],
  [/^(\d+) min ago$/, (_, n) => `${n} នាទីមុន`],
  [/^(\d+)h ago$/, (_, n) => `${n} ម៉ោងមុន`],
  [/^(\d+)d ago$/, (_, n) => `${n} ថ្ងៃមុន`],
  [/^Joined (.+)$/, (_, date) => `បានចូលរួម ${translate(date, "khmer")}`],
  [/^Year (\d+) — Semester (\d+)$/, (_, y, s) => `ឆ្នាំទី ${y} — ឆមាសទី ${s}`],
];

export const translate = (value, language = "english") => {
  if (language !== "khmer" || typeof value !== "string") return value;
  const trimmed = value.trim();
  let translated = km[trimmed];
  if (!translated) {
    for (const [pattern, replacement] of patterns) {
      const match = trimmed.match(pattern);
      if (match) { translated = replacement(...match); break; }
    }
  }
  return translated ? value.replace(trimmed, translated) : value;
};

const readLanguage = () => {
  try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}").language || "english"; }
  catch { return "english"; }
};

const LanguageContext = createContext({ language: "english", setLanguage: () => {}, t: (v) => v });

const originalText = new WeakMap();
const appliedText = new WeakMap();
const originalAttributes = new WeakMap();
const studentPath = /^\/(home|lessons|projects|calendar|profile|exam|settings|notifications)(\/|$)/;

const StudentTranslationBridge = ({ language }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!studentPath.test(pathname)) return undefined;
    let frame;
    const translateTree = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const parentTag = node.parentElement?.tagName;
        if (parentTag !== "STYLE" && parentTag !== "SCRIPT" && parentTag !== "NOSCRIPT") {
          const current = node.nodeValue;
          const lastApplied = appliedText.get(node);
          if (!originalText.has(node) || (lastApplied !== undefined && current !== lastApplied)) originalText.set(node, current);
          const source = originalText.get(node);
          const next = language === "khmer" ? translate(source, language) : source;
          if (current !== next) node.nodeValue = next;
          appliedText.set(node, next);
        }
        node = walker.nextNode();
      }

      document.querySelectorAll("input[placeholder], textarea[placeholder], [aria-label], [title]").forEach((element) => {
        const saved = originalAttributes.get(element) || {};
        ["placeholder", "aria-label", "title"].forEach((attribute) => {
          if (!element.hasAttribute(attribute)) return;
          const current = element.getAttribute(attribute);
          if (!(attribute in saved)) saved[attribute] = current;
          const next = language === "khmer" ? translate(saved[attribute], language) : saved[attribute];
          if (current !== next) element.setAttribute(attribute, next);
        });
        originalAttributes.set(element, saved);
      });
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(translateTree); };
    translateTree();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [language, pathname]);
  return null;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(readLanguage);
  const setLanguage = useCallback((next) => {
    const languageValue = next === "khmer" ? "khmer" : "english";
    try {
      const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, language: languageValue }));
    } catch { /* Keep language available for the current session. */ }
    setLanguageState(languageValue);
    window.dispatchEvent(new CustomEvent(LANGUAGE_EVENT, { detail: languageValue }));
  }, []);

  useEffect(() => {
    const sync = (event) => setLanguageState(event.detail || readLanguage());
    window.addEventListener(LANGUAGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(LANGUAGE_EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "khmer" ? "km" : "en";
    document.documentElement.classList.toggle("khmer-language", language === "khmer");
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t: (text) => translate(text, language) }), [language, setLanguage]);
  return <LanguageContext.Provider value={value}><StudentTranslationBridge language={language} />{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
export { LANGUAGE_EVENT };
