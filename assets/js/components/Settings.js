class Settings {
    /**
     * @constructor
     */
    constructor() {
        this.colorSelectorChange = this.handleColorSelectorChange.bind(this);
        this.pageSelectorChange = this.handlePageSelectorChange.bind(this);
        this.orderSelectorChange = this.handleOrderSelectorChange.bind(this);
        this.focusAddInput = this.handleFocusAddInput.bind(this);
        this.resetAddInput = this.handleResetAddInput.bind(this);
        this.submitNewItem = this.handleSubmitNewItem.bind(this);
    }

    /**
     * Initialize settings.
     *
     * @function init
     * @return {void}
     */
    init() {
        this.bindEvents();
        this.loadOrder();
    }

    /**
     * Bind all events.
     *
     * @function bindEvents
     * @return {void}
     */
    bindEvents() {
        document.addEventListener('select.selector', this.colorSelectorChange, false);
        document.addEventListener('select.selector', this.pageSelectorChange, false);
        document.addEventListener('select.selector', this.orderSelectorChange, false);
        document.addEventListener('opened.modal', this.focusAddInput, false);
        document.addEventListener('closed.modal', this.resetAddInput, false);
        document.newItemForm.addEventListener('submit', this.submitNewItem, false);
    }

    /**
     * Remove all events.
     *
     * @function removeEvents
     * @return {void}
     */
    removeEvents() {
        document.removeEventListener('select.selector', this.colorSelectorChange, false);
        document.removeEventListener('select.selector', this.pageSelectorChange, false);
        document.removeEventListener('select.selector', this.orderSelectorChange, false);
        document.removeEventListener('opened.modal', this.focusAddInput, false);
        document.removeEventListener('closed.modal', this.resetAddInput, false);
        document.newItemForm.removeEventListener('submit', this.submitNewItem, false);
    }

    /**
     * Load and set theme color on pocket load.
     *
     * @function loadTheme
     * @return {void}
     */
    loadTheme() {
        const theme = localStorage.getItem('theme');

        if (theme && THEMES.includes(theme)) {
            Helper.addClass(document.body, theme);

            const colorSelector = [...document.querySelectorAll('[name=selector-color]')];
            for (const selector of colorSelector) {
                if (selector.value === theme) {
                    selector.checked = true;
                }
            }
        }
    }

    /**
     * Set default page to load on extension load.
     *
     * @function setDefaultPage
     * @param {String} page - Page to set.
     * @return {void}
     */
    setDefaultPage(page = 'list') {
        localStorage.setItem('defaultPage', page);
    }

    /**
     * Get default page to load on extension load.
     *
     * @function getDefaultPage
     * @return {String | null}
     */
    getDefaultPage() {
        return localStorage.getItem('defaultPage');
    }

    /**
     * Set default page on pocket load.
     *
     * @function loadDefaultPage
     * @return {void}
     */
    loadDefaultPage() {
        let defaultPage = settings.getDefaultPage();

        if (defaultPage && defaultPage !== 'list' && !PAGES.includes(defaultPage)) {
            defaultPage = 'list';
            this.setDefaultPage(defaultPage);
        }

        pocket.changePage(defaultPage);

        if (defaultPage) {
            const pageSelector = [...document.querySelectorAll('[name=selector-page]')];
            for (const selector of pageSelector) {
                if (selector.value === defaultPage) {
                    selector.checked = true;
                }
            }
        }
    }

    loadOrder() {
        const order = localStorage.getItem('order');

        if (order) {
            this.rotateOrderButton(order === 'asc' ? true : false);

            const orderSelector = [...document.querySelectorAll('[name=selector-order]')];
            for (const selector of orderSelector) {
                if (selector.value === order) {
                    selector.checked = true;
                }
            }
        }
    }

    /**
     * Add class and change text in order by button.
     *
     * @function rotateOrderButton
     * @param {Boolean} orderItemsAsc - Order asc or desc.
     * @param {Event} e - Event from button click.
     * @return {void}
     */
    rotateOrderButton(orderItemsAsc, e) {
        const target = e && e.target ? e.target : document.querySelector('#js-orderButton');
        const orderDirectionText = document.querySelector('#js-orderDirectionText');

        if (orderItemsAsc) {
            target.classList.remove('is-rotated');
            orderDirectionText.innerText = chrome.i18n.getMessage('DESC');
        } else {
            target.classList.add('is-rotated');
            orderDirectionText.innerText = chrome.i18n.getMessage('ASC');
        }
    }

    /**
     * Handle default page selector in settings.
     *
     * @function handlePageSelectorChange
     * @param {Event} e - Selector change event.
     * @return {void}
     */
    handlePageSelectorChange(e) {
        if (e.detail.name === 'selector-page') {
            const page = e.detail.value.toString();

            if (PAGES.includes(page)) {
                this.setDefaultPage(page);

                selector.showMessage(e, true, `${chrome.i18n.getMessage('SAVED')}!`);
            }
        }
    }

    /**
     * Handle selector change event for color change.
     *
     * @function handleColorSelectorChange
     * @param {Event} e - Selector change event.
     * @return {void}
     */
    handleColorSelectorChange(e) {
        if (e.detail.name === 'selector-color') {
            const value = e.detail.value.toString();

            if (THEMES.includes(value)) {
                document.body.classList.remove(localStorage.getItem('theme'));
                localStorage.setItem('theme', value);
                document.body.classList.add(value);

                selector.showMessage(e, true, `${chrome.i18n.getMessage('SAVED')}!`);
            }
        }
    }

    handleOrderSelectorChange(e) {
        if (e.detail.name === 'selector-order') {
            const value = e.detail.value.toString();

            if (value === 'asc' || value === 'desc') {
                localStorage.setItem('order', value);
                selector.showMessage(e, true, `${chrome.i18n.getMessage('SAVED')}!`);
            }
        }
    }

    /**
     * Focus new item input when opening modal.
     *
     * @function handleFocusAddInput
     * @return {void}
     */
    handleFocusAddInput() {
        document.querySelector('#js-newItemInput').focus();
    }

    /**
     * Reset new item input value when closing modal.
     *
     * @function handleResetAddInput
     * @return {void}
     */
    handleResetAddInput() {
        document.querySelector('#js-newItemInput').value = '';
    }

    /**
     * Handle submitting new item adding form.
     *
     * @function handleSubmitNewItem
     * @param {Event} e - Submit event.
     * @return {void}
     */
    handleSubmitNewItem(e) {
        const form = e.target;

        if (form.checkValidity()) {
            e.preventDefault();
            helper.showMessage(`${chrome.i18n.getMessage('CREATING_ITEM')}...`, true, false, false);

            if (pocket.getActivePage() === 'list') {
                search.reset(true);
            }

            const rawData = new FormData(form);
            let data = {};

            for (const link of rawData.entries()) {
                data[link[0]] = link[1];
            }

            item.add(data);
        }
    }

    /**
     * Destroy settings.
     *
     * @function destroy
     * @return {void}
     */
    destroy() {
        this.removeEvents();
    }
}

const settings = new Settings();
