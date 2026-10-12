function toggleMenu() {
            const header = document.getElementById('site-header');
            const menuButton = document.querySelector('.menu-toggle');
            const isOpen = header.classList.toggle('menu-open');
            menuButton.setAttribute('aria-expanded', isOpen);
            menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
        }

        function submitSearch(event) {
            event.preventDefault();
            const query = document.getElementById('search-input').value.trim();
            if (query) window.location.hash = `search=${encodeURIComponent(query)}`;
            return false;
        }

        document.getElementById('registration-form').addEventListener('submit', async (event) => {
            event.preventDefault();

            const form = event.currentTarget;
            const status = document.getElementById('registration-status');
            const submitButton = form.querySelector('[type="submit"]');
            const password = form.elements.password.value;
            const confirmPassword = form.elements['confirm-password'].value;

            if (password !== confirmPassword) {
                form.elements['confirm-password'].setCustomValidity('Passwords do not match.');
                form.elements['confirm-password'].reportValidity();
                return;
            }

            form.elements['confirm-password'].setCustomValidity('');

            const config = window.SUPABASE_CONFIG;
            if (!window.supabase || !config || !config.url || !config.anonKey ||
                config.url.includes('YOUR_PROJECT_ID') || config.anonKey.includes('YOUR_SUPABASE')) {
                status.textContent = 'Supabase is not configured yet. Add your project URL and public key to supabase-config.js.';
                status.hidden = false;
                return;
            }

            status.hidden = true;
            submitButton.disabled = true;
            submitButton.textContent = 'Creating account...';

            try {
                const client = window.supabase.createClient(config.url, config.anonKey);
                const { error } = await client.auth.signUp({
                    email: form.elements.email.value.trim(),
                    password,
                    options: {
                        emailRedirectTo: new URL('success.html', window.location.href).href,
                        data: {
                            surname: form.elements.name.value.trim(),
                            other_name: form.elements['other-name'].value.trim()
                        }
                    }
                });

                if (error) throw error;
                window.location.href = 'success.html';
            } catch (error) {
                status.textContent = error.message || 'We could not create your account. Please try again.';
                status.hidden = false;
                submitButton.disabled = false;
                submitButton.textContent = 'Create account';
            }
        });

        document.querySelector('#registration-form [name="confirm-password"]').addEventListener('input', (event) => {
            event.currentTarget.setCustomValidity('');
        });

        document.querySelectorAll('.password-visibility-toggle').forEach((toggle) => {
            toggle.addEventListener('click', () => {
                const passwordInput = document.getElementById(toggle.getAttribute('aria-controls'));
                const shouldShow = passwordInput.type === 'password';
                passwordInput.type = shouldShow ? 'text' : 'password';
                toggle.setAttribute('aria-pressed', String(shouldShow));
                toggle.setAttribute('aria-label', `${shouldShow ? 'Hide' : 'Show'} ${passwordInput.labels[0].textContent.toLowerCase()}`);
            });
        });