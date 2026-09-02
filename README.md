# Samarth eGov - Kumaun University Student Portal (Login UI)

A pixel-perfect, responsive replica of the official **Samarth eGov / Kumaun University Nainital Student Portal** login interface.

![Portal Preview](assets/banners/banner1.svg)

## 📌 Features

- **Government Portal Header**: Bilingual department links (Hindi/English) for Government of India, Uttarakhand Govt Portal, Ministry of Education, Dept of Higher Education, and Kumaun University Nainital.
- **Accessibility Controls**: Dynamic Font Resizer (`A-`, `A`, `A+`) to scale base typography.
- **Top Dark Navbar**: Standard Samarth eGov branding with quick Login and "New User Registration" actions.
- **Promotional / Career Banners**: National internship schemes and career enhancement graphics.
- **Student Login Module**:
  - University Crest & Header
  - "General Instructions for Login" modal
  - Student Portal identifier (`● ● ● Student Portal`)
  - Form validation with exact error indicators (`Enrolment Number cannot be blank.`)
  - Click-to-refresh dynamic 7-digit Captcha generator
  - "New User ? Register Now ->" flow
  - "Forgot Password? Request Password Reset ->" modal
- **Bottom Bar**: Samarth eGov branding with "View Public Notice" modal.

## 🚀 How to Run Locally

Simply open `index.html` in any modern web browser or serve via:
```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve .
```

## 🛠️ Tech Stack
- HTML5 (Semantic markup)
- CSS3 (Custom CSS properties, Flexbox, CSS Grid, Responsive design)
- JavaScript (DOM manipulation, Captcha generation, Validation, Modals)
- SVG vector graphics for logos and banners
