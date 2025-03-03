$(document).ready(function () {
    let $employeeTableBody = $(".emp-dash-table-body");
    let $addUserButton = $(".emp-dash-nav-add-user button");
    let $searchBox = $("#emp-dash-main-search-box");

    function loadEmployees() {
        $.get("http://localhost:3000/employees", function (employees) {
            $employeeTableBody.empty();

            employees.forEach((employee, index) => {
                let row = `<tr>
                    <td>
                        <div class="emp-dash-table-body-img">
                            <img src="${employee.profileImage}" alt="Employee Photo">
                            <span>${employee.name}</span>
                        </div>
                    </td>
                    <td>${employee.gender}</td>
                    <td>${employee.departments.join(", ")}</td>
                    <td>${employee.salary}</td>
                    <td>${employee.startDate}</td>
                    <td class="emp-actions">
                        <i class="fa-solid fa-pen edit-btn" data-id="${employee.id}"></i>
                        <i class="fa-solid fa-trash delete-btn" data-id="${employee.id}"></i>
                    </td>
                </tr>`;
                $employeeTableBody.append(row);
            });

            attachEventListeners();
        }).fail(function (error) {
            console.error("Error loading employees:", error);
        });
    }

    function addEmployee() {
        localStorage.removeItem("editEmployee");
        window.location.href = "./empRegister.html";
    }

    function deleteEmployee() {
        let id = $(this).data("id");
        $.ajax({
            url: `http://localhost:3000/employees/${id}`,
            type: "DELETE",
            success: function () {
                loadEmployees();
            },
            error: function (error) {
                console.error("Error deleting employee:", error);
            }
        });
    }

    function editEmployee() {
        let id = $(this).data("id");
        localStorage.setItem("editEmployeeId", id); // Temporarily store ID in localStorage
        window.location.href = "./empRegister.html";
    }

    function searchByName() {
        let searchValue = $searchBox.val().toLowerCase();
        $.get("http://localhost:3000/employees", function (employees) {
            let hasMatch = false;
            $employeeTableBody.empty();

            employees.forEach((employee, index) => {
                if (employee.name.toLowerCase().includes(searchValue)) {
                    let row = `<tr>
                        <td>
                            <div class="emp-dash-table-body-img">
                                <img src="${employee.profileImage}" alt="Employee Photo">
                                <span>${employee.name}</span>
                            </div>
                        </td>
                        <td>${employee.gender}</td>
                        <td>${employee.departments.join(", ")}</td>
                        <td>${employee.salary}</td>
                        <td>${employee.startDate}</td>
                        <td class="emp-actions">
                            <i class="fa-solid fa-pen edit-btn" data-id="${employee.id}"></i>
                            <i class="fa-solid fa-trash delete-btn" data-id="${employee.id}"></i>
                        </td>
                    </tr>`;
                    $employeeTableBody.append(row);
                    hasMatch = true;
                }
            });

            if (!hasMatch) {
                $employeeTableBody.html('<tr><td colspan="6" style="text-align: center; font-weight: bold; color: red;">No matches found</td></tr>');
            } else {
                attachEventListeners();
            }
        }).fail(function (error) {
            console.error("Error searching employees:", error);
        });
    }

    function attachEventListeners() {
        $(".delete-btn").off("click").on("click", deleteEmployee);
        $(".edit-btn").off("click").on("click", editEmployee);
    }

    $addUserButton.on("click", addEmployee);
    $searchBox.on("input", searchByName);

    loadEmployees();
});