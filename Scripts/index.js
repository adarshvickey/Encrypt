/*
================================================================
PART 1: 3D SCENE (No changes needed here)
================================================================
*/
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const geometry = new THREE.IcosahedronGeometry(1.2, 0); 
const material = new THREE.MeshStandardMaterial({ color: 0x00ff83, wireframe: true });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
const pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.position.set(2, 3, 4);
scene.add(pointLight);
const sizes = { width: window.innerWidth, height: window.innerHeight };
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 2.9;
scene.add(camera);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
let mouseX = 0;
let mouseY = 0;
window.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / sizes.width) * 2 - 1;
    mouseY = -(event.clientY / sizes.height) * 2 + 1;
});
const clock = new THREE.Clock();
const animate = () => {
    const elapsedTime = clock.getElapsedTime();
    mesh.rotation.y = 12 * elapsedTime;
    mesh.rotation.y += .5 * (mouseX - mesh.rotation.y);
    mesh.rotation.x += .5 * (mouseY - mesh.rotation.x);
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
};
animate();
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/*
================================================================
PART 2: NEW INTERACTIVE FEATURES
================================================================
*/
document.addEventListener('DOMContentLoaded', () => {

    // --- HAMBURGER MENU ---
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // --- BACK TO TOP BUTTON ---
    const backToTopButton = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { // Show button after scrolling 300px
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    // --- FADE-IN SECTIONS ON SCROLL ---
    const sections = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the section is visible
    });
    sections.forEach(section => observer.observe(section));

    // --- ACTIVE NAV LINK HIGHLIGHTING (SCROLL SPY) ---
    const navLinksList = document.querySelectorAll('.nav-links a');
    const allSections = document.querySelectorAll('section, header');

    window.addEventListener('scroll', () => {
        let current = '';
        allSections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - (window.innerHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinksList.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href').substring(1) === current) {
                a.classList.add('active');
            }
        });
    });
});
