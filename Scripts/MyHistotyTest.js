    function toggleDetails(orderElement) {
        const details = orderElement.querySelector('.order-details');
        const isOpen = details.style.display === "block";

        document.querySelectorAll('.order-details').forEach(el => el.style.display = "none");

        document.querySelectorAll('.order').forEach(el => el.classList.remove('expanded'));

        if (!isOpen) {
            details.style.display = "block";
            orderElement.classList.add('expanded');
        }
    }