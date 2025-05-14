<template>
  <div class="home row" v-if="!authenticated">
    <section id="hero" class="hero section">
      <div class="container" data-aos="fade-up" data-aos-delay="100">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <div class="hero-content" data-aos="fade-up" data-aos-delay="200">
              <div class="company-badge mb-4">
                <img src="../../../content/images/s2m.svg" alt="Gear Icon" style="width: 60px; height: 40px; margin-right: 8px" />
                <span v-text="t$('home.di')"></span>
              </div>
              <h1 class="mb-4">
                <span v-text="t$('home.text1')"></span><br />
                <span v-text="t$('home.sd')"></span> <br />
                <span class="accent-text" v-text="t$('home.sp')"></span>
              </h1>
              <p class="mb-4 mb-md-5" v-text="t$('home.desc')"></p>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="hero-image" data-aos="zoom-out" data-aos-delay="300">
              <img src="../../../content/images/hero-img.png" alt="Hero Image" class="img-fluid" />

              <div class="customers-badge">
                <div class="customer-avatars">
                  <img src="../../../content/images/avatar-1.webp" alt="Customer 1" class="avatar" />
                  <img src="../../../content/images/avatar-2.webp" alt="Customer 2" class="avatar" />
                  <img src="../../../content/images/avatar-3.webp" alt="Customer 3" class="avatar" />
                  <img src="../../../content/images/avatar-4.webp" alt="Customer 4" class="avatar" />
                  <img src="../../../content/images/avatar-5.webp" alt="Customer 5" class="avatar" />
                  <span class="avatar more">12+</span>
                </div>
                <p class="mb-0 mt-2" v-text="t$('home.refTitle')"></p>
              </div>
            </div>
          </div>
        </div>

        <div class="row stats-row gy-4 mt-5" data-aos="fade-up" data-aos-delay="500">
          <!-- Équipe Commerciale -->
          <div class="col-lg-4 col-md-6">
            <div class="stat-item text-center">
              <div class="stat-icon mb-2">
                <i class="bi bi-people-fill"></i>
              </div>
              <div class="stat-content">
                <h4 v-text="t$('home.equipeC')"></h4>
                <p class="mb-0" v-text="t$('home.equipeCdesc')"></p>
              </div>
            </div>
          </div>

          <!-- Équipe Déploiement -->
          <div class="col-lg-4 col-md-6">
            <div class="stat-item text-center">
              <div class="stat-icon mb-2">
                <i class="bi bi-people-fill"></i>
              </div>
              <div class="stat-content">
                <h4 v-text="t$('home.equipeD')"></h4>
                <p class="mb-0" v-text="t$('home.equipeDdesc')"></p>
              </div>
            </div>
          </div>

          <!-- Administrateur -->
          <div class="col-lg-4 col-md-6">
            <div class="stat-item text-center">
              <div class="stat-icon mb-2">
                <i class="bi bi-shield-lock-fill"></i>
              </div>
              <div class="stat-content">
                <h4 v-text="t$('home.equipeA')"></h4>
                <p class="mb-0" v-text="t$('home.equipeAdesc')"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  <div class="home row" v-if="authenticated">
    <div class="section"></div>
    <div class="section"></div>
    <div class="section"></div>
    <div class="section"></div>
    <div class="section"></div>
    <div class="section"></div>
  </div>
</template>

<script lang="ts" src="./home.component.ts"></script>
