<script setup lang="ts">
import { t } from '../i18n'
import { grantConsent, setLang } from '../stores/settings'
import { lang } from '../i18n'
</script>

<template>
  <div class="modal-backdrop consent-backdrop">
    <div class="modal consent">
      <div class="lang-row">
        <button class="btn btn-sm" :class="{ 'btn-primary': lang === 'tr' }" @click="setLang('tr')">TR</button>
        <button class="btn btn-sm" :class="{ 'btn-primary': lang === 'en' }" @click="setLang('en')">EN</button>
      </div>
      <div class="icon">🔐</div>
      <h1>{{ t('consentTitle') }}</h1>
      <p>{{ t('consentBody') }}</p>
      <button class="btn btn-primary big" @click="grantConsent()">{{ t('consentAccept') }}</button>
      <small>{{ t('consentNote') }}</small>
    </div>
  </div>
</template>

<style scoped>
.consent-backdrop { background: var(--bg); z-index: 300; }
.consent {
  width: min(480px, calc(100vw - 32px));
  padding: 36px 32px 28px;
  text-align: center;
  align-items: center;
  gap: 14px;
  position: relative;
}
.lang-row { position: absolute; top: 14px; right: 14px; display: flex; gap: 6px; }
.icon { font-size: 44px; }
h1 { font-size: 21px; margin: 4px 0; }
p { color: var(--text-dim); line-height: 1.6; font-size: 13.5px; }
.big { padding: 12px 26px; font-size: 15px; margin-top: 8px; align-self: center; }
small { color: var(--text-mute); font-size: 11.5px; }
</style>
