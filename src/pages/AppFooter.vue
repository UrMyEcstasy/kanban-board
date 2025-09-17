<template>
  <footer class="footer">
    <div class="footer__left"></div> <!-- пустая зона для симметрии -->

    <div class="footer__phrase">
      <span class="letter">P</span>
      <span class="letter">o</span>
      <span class="letter">w</span>
      <span class="letter">e</span>
      <span class="letter">r</span>
      <span class="letter">e</span>
      <span class="letter">d</span>
      <span class="space"></span>
      <span class="letter">b</span>
      <span class="letter">y</span>
      <span class="space"></span>
      <span class="letter">U</span>
      <span class="letter">r</span>
      <span class="letter">M</span>
      <span class="letter">y</span>
      <span class="letter">E</span>
      <span class="letter">c</span>
      <span class="letter">s</span>
      <span class="letter">t</span>
      <span class="letter">a</span>
      <span class="letter">s</span>
      <span class="letter">y</span>
    </div>

    <div class="footer__socials">
      <a
          class="footer__github"
          href="https://github.com/urmyecstasy"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub"
      >
        <img src="@/assets/footer/github.svg" alt="GitHub"/>
      </a>

      <a
          class="footer__telegram"
          href="https://t.me/urmyecstasy"
          target="_blank"
          rel="noopener noreferrer"
          title="Telegram"
      >
        <img src="@/assets/footer/telegram.svg" alt="Telegram"/>
      </a>
    </div>
  </footer>

</template>

<script setup>

// логика отсутствует ( у футера, не у меня, хотя...)


</script>

<style scoped>

.footer {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  background-color: #333337;
  padding: 15px 20px;
}

.footer__phrase {
  display: flex;
  justify-content: center;
}

.footer__socials {
  display: flex;
  gap: 15px;
  justify-self: end;
}

.footer__socials img {
  width: 30px;
  height: 30px;
  filter: brightness(0) invert(1);
  transition: transform 0.3s ease, filter 0.3s ease;
  cursor: pointer;
}

.footer__socials img:hover {
  transform: scale(1.2);
  filter: brightness(0) invert(0.6) sepia(1) hue-rotate(150deg) saturate(3);
}


.space {
  margin: 0 10px;
}


@keyframes lightning {
  0% {
    text-shadow: none;
  }
  90% {
    text-shadow: none;
  }
  100% {
    color: #16A085;
    text-shadow: 0 0 30px #00adb5;
  }
}

.letter {
  font-family: 'Audiowide', cursive;
  animation: lightning 5s linear infinite;
}

.letter:nth-child(1) {
  animation-delay: 0s;
}

.letter:nth-child(2) {
  animation-delay: 0.1s;
}

.letter:nth-child(3) {
  animation-delay: 0.2s;
}

.letter:nth-child(4) {
  animation-delay: 0.3s;
}

.letter:nth-child(5) {
  animation-delay: 0.4s;
}

.letter:nth-child(6) {
  animation-delay: 0.5s;
}

.letter:nth-child(7) {
  animation-delay: 0.6s;
}

.letter:nth-child(8) {
  animation-delay: 0.7s;
}

.letter:nth-child(9) {
  animation-delay: 0.8s;
}

.letter:nth-child(10) {
  animation-delay: 0.9s;
}

.letter:nth-child(11) {
  animation-delay: 1s;
}

.letter:nth-child(12) {
  animation-delay: 1.1s;
}

.letter:nth-child(13) {
  animation-delay: 1.2s;
}

.letter:nth-child(14) {
  animation-delay: 1.3s;
}

.letter:nth-child(15) {
  animation-delay: 1.4s;
}

.letter:nth-child(16) {
  animation-delay: 1.5s;
}

.letter:nth-child(17) {
  animation-delay: 1.6s;
}

.letter:nth-child(18) {
  animation-delay: 1.7s;
}

.letter:nth-child(19) {
  animation-delay: 1.8s;
}

.letter:nth-child(20) {
  animation-delay: 1.9s;
}

.letter:nth-child(21) {
  animation-delay: 2.0s;
}

.letter:nth-child(22) {
  animation-delay: 2.1s;
}


</style>
