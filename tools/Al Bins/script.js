document.addEventListener('DOMContentLoaded', () => {

    // Mobile Navigation Toggle
    const hamburger = document.getElementById('hamburger-button');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile nav when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });

    // Intersection Observer for animations
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    animatedElements.forEach(element => {
        observer.observe(element);
    });

    // Contact Form Handling (Front-end only)
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // This is a front-end demonstration.
        // In a real application, you would send this data to a server.
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        
        formStatus.textContent = `Thank you, ${name}. Your message has been received. We will contact you shortly.`;
        formStatus.style.color = 'green';
        
        contactForm.reset();

        setTimeout(() => {
            formStatus.textContent = '';
        }, 5000);
    });
});