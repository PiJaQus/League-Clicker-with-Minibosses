let strudelHandle = null

function isBattleMusicEnabled() {
  try {
    const store = localStorage.getItem('cooker_v2')
    if (store) {
      const parsed = JSON.parse(store)
      return parsed.settings?.battleMusic !== false && parsed.settings?.sound !== false
    }
    return true
  } catch (e) {
    return true
  }
}

export async function startStrudelBattleMusic() {
  try {
    if (!isBattleMusicEnabled()) return
    if (strudelHandle) return

    const { initStrudel } = await import('@strudel/web')
    await initStrudel()

    // 🔊 1) Ładujemy Dirt-Samples (bd/sd/hh itd.)
    if (window.samples) {
      window.samples({
        bd:  'bd/BT0AADA.wav',
        sd:  'sd/rytm-01-classic.wav',
        hh:  'hh27/000_hh27closedhh.wav',
        rim: 'sd/rytm-01-classic.wav',
        rd:  'hh27/000_hh27closedhh.wav',
      }, 'github:tidalcycles/Dirt-Samples/master/')

      // 🔊 2) Ładujemy crate – żeby .bank('crate') miało sens
      window.samples('github:eddyflux/crate')

      // 🔊 3) Gitara – gm_electric_guitar_muted jako sample
      window.samples({
        gm_electric_guitar_muted: 'samples/guitar/guitar_0.wav',
      }, 'github:jarmitage/jarmitage.github.io/master/')
    }

    if (window.hush) window.hush()

    // z Twojego: let chords = chord("<Bbm9 Fm9>/4").dict('ireal')
    const chords = window.chord("<Bbm9 Fm9>/4").dict('ireal')

    // === 1) LEAD
    // $: note(...).sound("gm_electric_guitar_muted").delay(.5)
    const lead = window.note("[~ [<[d3,a3,f4]!2 [d3,bb3,g4]!2> ~]]*2")
        .s("gm_electric_guitar_muted")
        .gain(0.8)
        .delay(0.5)

    // === 2) PROSTE BĘBNY ===
    // $: s("bd sd [~ bd] sd").room("<0 .2 .4 >").bank("RolandTR707")
    // Bank „RolandTR707” w REPL-u to inna paczka; tu używamy bd/sd z Dirt-Samples
    const drumsSimple = window.s("bd sd [~ bd] sd")
        .room("<0 .2 .4 >")
        .gain(1.0)

    // === 3) NUTY LICZBOWE ===
    // $: n("[0 [~ 1] 5 [3 2] [0 ~] [0 ~] ~]/2")
    const bassLike = window.n("[0 [~ 1] 5 [3 2] [0 ~] [0 ~] ~]/2")
        .gain(0.8) // trochę głośniej, żeby było słychać

    // === 4) DUŻY STACK DRUMS na crate ===
    // $:stack(stack( ... ).bank('crate').mask("<[0 1] 1 1 1>/16".early(.5)) )
    const drumsComplexInner = window.stack(
        window.s("bd").struct("<[x*<1 2> [~@3 x]] x>"),
        window.s("~ [rim, sd:<2 3>]").room("<0 .2>"),
        window.n("[0 <1 3>]*<2!3 4>").s("hh"),
        window.s("rd:<1!3 2>*2")
            .mask("<0 0 1 1>/16")
            .gain(0.5)
    ).bank('crate') // teraz crate jest faktycznie załadowane

    const drumsComplex = drumsComplexInner
        .mask("<[0 1] 1 1 1>/16").early(0.5) // poprawione .early

    // === 5) WSZYSTKO RAZEM – jak kilka $: naraz ===
    strudelHandle = window.stack(
        lead,          // gitara
        drumsSimple,   // prosty bd/sd
        bassLike,      // pattern liczbowy
        drumsComplex   // crate-drums
    )
        .late("[0 .01]*4")
        .late("[0 .01]*2")
        .size(4)
        .gain(0.3)
        .play()
  } catch (e) {
    // silently fail if strudel is not available
  }
}

export function stopStrudelBattleMusic() {
  try {
    if (window.hush) {
      window.hush()
    }
    strudelHandle = null
  } catch (e) {
    // silently fail
  }
}
