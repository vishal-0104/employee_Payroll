let form = document.querySelector("form");
let submitButton = document.getElementById("emp-reg-submit-button");
let nameInput = document.getElementById("name");

// Name Validation
nameInput.addEventListener("input", () => {
    let namePattern = /^[A-Za-z\s]{3,50}$/;
    nameInput.setCustomValidity(namePattern.test(nameInput.value) ? "" : "Name should only contain letters (3-50 characters). No numbers or special characters allowed.");
    nameInput.reportValidity();
});

// Profile Image Validation
function isProfileImageSelected() {
    return document.querySelector("input[name='profile-image']:checked") !== null;
}

document.querySelectorAll("input[name='profile-image']").forEach((radio) => {
    radio.addEventListener("change", () => {
        document.querySelectorAll("input[name='profile-image']").forEach(r => r.setCustomValidity(""));
    });
});

// Gender Validation
function isGenderSelected() {
    return document.querySelector("input[name='gender']:checked") !== null;
}

document.querySelectorAll("input[name='gender']").forEach((radio) => {
    radio.addEventListener("change", () => {
        document.querySelectorAll("input[name='gender']").forEach(r => r.setCustomValidity(""));
    });
});

// Department Validation
function isDepartmentSelected() {
    return document.querySelector("input[name='department']:checked") !== null;
}

document.querySelectorAll("input[name='department']").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
        document.querySelectorAll("input[name='department']").forEach(c => c.setCustomValidity(""));
    });
});

// Salary Validation
let salarySelect = document.getElementById("salary");
salarySelect.addEventListener("change", () => {
    salarySelect.setCustomValidity(salarySelect.value ? "" : "Please select a salary.");
    salarySelect.reportValidity();
});

// Date Validation
let daySelect = document.querySelector("select[name='day']");
let monthSelect = document.querySelector("select[name='month']");
let yearSelect = document.querySelector("select[name='year']");

function validateDateField(selectElement, message) {
    selectElement.setCustomValidity(selectElement.value ? "" : message);
    selectElement.reportValidity();
}

daySelect.addEventListener("change", () => validateDateField(daySelect, "Please select a valid day."));
monthSelect.addEventListener("change", () => validateDateField(monthSelect, "Please select a valid month."));
yearSelect.addEventListener("change", () => validateDateField(yearSelect, "Please select a valid year."));

// Populate Form for Editing
function populateFormForEdit(employeeId) {
    fetch(`http://localhost:3000/employees/${employeeId}`)
        .then(response => response.json())
        .then(employee => {
            nameInput.value = employee.name;
            document.querySelector(`input[name='profile-image'][id='${employee.profileImage.split('/').pop().split('.')[0]}']`).checked = true;
            document.querySelector(`input[name='gender'][value='${employee.gender}']`).checked = true;
            employee.departments.forEach(dep => {
                document.querySelector(`input[name='department'][value='${dep}']`).checked = true;
            });
            salarySelect.value = employee.salary;
            let [day, month, year] = employee.startDate.split('-');
            daySelect.value = day;
            monthSelect.value = month;
            yearSelect.value = year;
            document.querySelector("textarea").value = employee.notes || "";
        })
        .catch(error => console.error("Error fetching employee:", error));
}

if (localStorage.getItem("editEmployeeId")) {
    populateFormForEdit(localStorage.getItem("editEmployeeId"));
}

// Form Submission Handler
form.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent default form submission

    let isValid = true;

    // Profile Image Validation
    if (!isProfileImageSelected()) {
        document.querySelectorAll("input[name='profile-image']").forEach(r => r.setCustomValidity("Please select a profile image."));
        document.querySelector("input[name='profile-image']").reportValidity();
        isValid = false;
    }

    // Gender Validation
    if (!isGenderSelected()) {
        document.querySelectorAll("input[name='gender']").forEach(r => r.setCustomValidity("Please select a gender."));
        document.querySelector("input[name='gender']").reportValidity();
        isValid = false;
    }

    // Department Validation
    if (!isDepartmentSelected()) {
        document.querySelectorAll("input[name='department']").forEach(c => c.setCustomValidity("Please select at least one department."));
        document.querySelector("input[name='department']").reportValidity();
        isValid = false;
    }

    // Salary Validation
    if (!salarySelect.value) {
        salarySelect.setCustomValidity("Please select a salary.");
        salarySelect.reportValidity();
        isValid = false;
    }

    // Date Validation
    validateDateField(daySelect, "Please select a valid day.");
    validateDateField(monthSelect, "Please select a valid month.");
    validateDateField(yearSelect, "Please select a valid year.");

    if (!daySelect.value || !monthSelect.value || !yearSelect.value) {
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    // Prepare Employee Data
    let selectedProfileImage = document.querySelector("input[name='profile-image']:checked");
    let profileImagePath = selectedProfileImage 
        ? document.querySelector(`label[for='${selectedProfileImage.id}'] img`)?.src || ""
        : "";

    let employeeData = {
        name: nameInput.value,
        profileImage: profileImagePath,
        gender: document.querySelector("input[name='gender']:checked").value,
        departments: Array.from(document.querySelectorAll("input[name='department']:checked")).map(dep => dep.value),
        salary: salarySelect.value,
        startDate: `${daySelect.value}-${monthSelect.value}-${yearSelect.value}`,
        notes: document.querySelector("textarea").value.trim()
    };

    // Check if Editing or Adding
    let editEmployeeId = localStorage.getItem("editEmployeeId");
    if (editEmployeeId) {
        // Update Existing Employee
        fetch(`http://localhost:3000/employees/${editEmployeeId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(employeeData)
        })
        .then(() => {
            console.log("Employee updated successfully");
            alert("Employee updated successfully");
            localStorage.removeItem("editEmployeeId");
        })
        .catch(error => console.error("Error updating employee:", error));
    } else {
        // Add New Employee
        fetch("http://localhost:3000/employees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(employeeData)
        })
        .then(() => {
            console.log("Employee registered successfully");
            alert("Employee registered successfully");
            form.reset();
        })
        .catch(error => console.error("Error adding employee:", error));
    }

    // Redirect to dashboard after submission
    window.location.href = "../Pages/empDashboard.html";
});