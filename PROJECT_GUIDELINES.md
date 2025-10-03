# Project Guidelines

## Purpose
This document provides a unified set of rules and standards for naming conventions, task assignments, environment setup, and general coding practices.  
Its goal is to ensure consistency, maintainability, and collaboration across the development team.

---

## Naming Conventions

- **Variables**: `camelCase`  
  *Example*: `userName`, `vehicleCost`

- **Functions / Methods**: `PascalCase`  
  *Example*: `GetUserById()`, `GetUserData()`

- **Classes**: `PascalCase`  
  *Example*: `UserRepository`, `UserService`

- **Class Properties**: `PascalCase`  
  *Example*: `UserId`, `SessionType`

- **Files (Data Access Layer)**: `PascalCaseRepository`  
  *Example*: `SessionRepository.cs`, `UserRepository.cs`

- **Files (Business Logic Layer)**: `PascalCaseService`  
  *Example*: `SessionService.cs`, `UserService.cs`

- **Files (Presentation Layer)**: `PascalCaseController`  
  *Example*: `StudentController.cs`, `SessionController.cs`

---

## Task Assignments

- **Ahmed Hamdy**  
  - Responsible for classes: `User`, `Instructor`, ...

- **Abd-Elrahman Mohammed**  
  - Responsible for classes: `Student`, `SessionGroup`, `SessionsSchedule`, `StudentsSessionGroup`

---

## Environment Configuration

### Adding `ConnectionString` and `JWT` Key

- **Connection String**  
  ```bash
  setx ConnectionStrings__DefaultConnection "Your_Connection_String_Here"

- **Jwt Key**
  ```bash
  setx JWT__Key "The_Key_Here"

## General Guidelines

- Follow **clean code practices**.  
- Use **meaningful and consistent naming**.  
- Write **clear, descriptive commit messages**.  
- Do **not merge into `master`** without proper code review.  
- Place **DTOs** in the appropriate folder within the Domain Layer project:  

  `BIS.Domain/DTOs/StudentDTOs/`  

  Example files:  
  - `CreateStudentDto.cs`  
  - `UpdateStudentDto.cs`  
  - `StudentDto.cs`  

- Place **Enums** in the `Enums` folder within the Domain Layer project.
