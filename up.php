<html lang="el">
<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>Credentials Module</title>

<link
href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
rel="stylesheet">

<link href="./css/style.css" rel="stylesheet" >

<script src="https://unpkg.com/dexie/dist/dexie.js"></script>


</head>
<body>
<div class="container py-4">

<div class="card shadow-sm p-4 mb-4">

<div class="d-flex justify-content-between align-items-center flex-wrap gap-3">

<div>
<h1 class="mb-1">Medical LogBook</h1>
<p class="text-muted mb-0">
Ηλεκτρονικό Portfolio Ειδικευόμενου Ιατρού
</p>
</div>

<div>
<button class="btn btn-outline-primary" id="loginBtn">

Login with Google

</button>

<button class="btn btn-outline-danger" id="logoutBtn">

Logout

</button>

<div id="userBox"></div>
</div>

</div>

</div>
</div>


<div class="container py-4">

<ul class="nav nav-tabs" id="mainTabs">

  <li class="nav-item">
    <button class="nav-link active"
            data-bs-toggle="tab"
            data-bs-target="#credentials">
      Πτυχία
    </button>
  </li>

  <li class="nav-item">
    <button class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#jobs">
      Προϋπηρεσίες
    </button>
  </li>

  <li class="nav-item">
    <button class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#publications">
      Δημοσιεύσεις
    </button>
  </li>
  
  <li class="nav-item">
    <button class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#conferences">
      Συνέδρια
    </button>
  </li>
  
  <li class="nav-item">
    <button class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#presentations">
      Ανακοινώσεις
    </button>
  </li>
  
  <li class="nav-item">
    <button class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#medical_proc">
      Ιατρικές πράξεις
    </button>
  </li>
  
  <li class="nav-item">
    <button class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#proced">
      Χειρουργεία
    </button>
  </li>
  
  <li class="nav-item">
    <button class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#research">
      Έρευνα
    </button>
  </li>
  
  <li class="nav-item">
    <button class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#awards">
      Βραβεία
    </button>
  </li>
  
  <li class="nav-item">
    <button class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#educat">
      Εκπαιδευτικό έργο
    </button>
  </li>
  
  <li class="nav-item">
    <button class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#Prostgrad_training">
      Μετεκπαιδεύσεις
    </button>
  </li>
  
  <li class="nav-item">
    <button class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#seminars">
      Σεμινάρια
    </button>
  </li>
  
  <li class="nav-item">
    <button class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#associations">
      Εταιρείες & Σύλλογοι
    </button>
  </li>
  
  <li class="nav-item">
    <button class="nav-link"
            data-bs-toggle="tab"
            data-bs-target="#langue_hob">
      Ξένες γλώσσες & Χόμπι
    </button>
  </li>

</ul>

<div class="tab-content">