<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { X, ZoomIn, ZoomOut, ExternalLink } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = defineProps<{
    open: boolean
    src: string
    alt?: string
    title?: string
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

const isOriginalSize = ref(false)

function toggleSize() {
    isOriginalSize.value = !isOriginalSize.value
}

function handleKeydown(e: KeyboardEvent) {
    if (props.open && e.key === 'Escape') {
        emit('close')
    }
}

watch(
    () => props.open,
    (val) => {
        if (val) {
            isOriginalSize.value = false
            window.addEventListener('keydown', handleKeydown)
            document.body.style.overflow = 'hidden'
        } else {
            window.removeEventListener('keydown', handleKeydown)
            document.body.style.overflow = ''
        }
    },
    { immediate: true }
)

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = ''
})
</script>

<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="props.open"
                class="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-md select-none"
                @click.self="emit('close')"
            >
                <!-- Top Toolbar -->
                <div
                    class="relative z-10 flex items-center justify-between px-3 sm:px-6 py-3 bg-black/40 border-b border-white/10 text-white shrink-0 gap-3"
                >
                    <!-- Left: Title & Mode Badge -->
                    <div class="flex items-center gap-2.5 min-w-0">
                        <h3 class="text-sm sm:text-base font-semibold truncate text-white/90">
                            {{ props.title || props.alt || 'Photo' }}
                        </h3>
                        <span
                            class="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15 hidden sm:inline-flex shrink-0 font-medium"
                        >
                            {{ isOriginalSize ? 'Taille originale (100%)' : 'Ajusté à l\'écran' }}
                        </span>
                    </div>

                    <!-- Right: Actions -->
                    <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <!-- Toggle Fit / 100% Zoom -->
                        <Button
                            variant="ghost"
                            size="sm"
                            class="text-white hover:bg-white/20 hover:text-white rounded-lg h-9 px-2.5 sm:px-3 text-xs gap-1.5 transition-colors border border-white/15 bg-white/5"
                            :title="isOriginalSize ? 'Ajuster à l\'écran' : 'Afficher en taille originale'"
                            @click.stop="toggleSize"
                        >
                            <ZoomOut v-if="isOriginalSize" class="w-4 h-4" />
                            <ZoomIn v-else class="w-4 h-4" />
                            <span class="hidden sm:inline">{{ isOriginalSize ? 'Ajuster' : 'Taille originale' }}</span>
                        </Button>

                        <!-- Open in new tab -->
                        <a
                            :href="props.src"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="inline-flex items-center justify-center h-9 px-2.5 sm:px-3 rounded-lg text-xs font-medium text-white hover:bg-white/20 transition-colors border border-white/15 bg-white/5 gap-1.5"
                            title="Ouvrir le fichier image dans un nouvel onglet"
                            @click.stop
                        >
                            <ExternalLink class="w-4 h-4" />
                            <span class="hidden sm:inline">Ouvrir</span>
                        </a>

                        <!-- Close Button -->
                        <Button
                            variant="ghost"
                            size="icon"
                            class="text-white hover:bg-white/20 hover:text-white rounded-lg h-9 w-9 transition-colors ml-1 border border-white/15 bg-white/5"
                            title="Fermer (Échap)"
                            @click.stop="emit('close')"
                        >
                            <X class="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <!-- Main Image Container -->
                <div
                    class="flex-1 min-h-0 w-full flex items-center justify-center p-2 sm:p-6 overflow-auto"
                    :class="isOriginalSize ? 'cursor-zoom-out' : 'cursor-zoom-in'"
                    @click.self="emit('close')"
                >
                    <img
                        :src="props.src"
                        :alt="props.alt || props.title || 'Photo originale'"
                        :class="[
                            'transition-transform duration-150 select-none shadow-2xl rounded-lg',
                            isOriginalSize
                                ? 'max-w-none max-h-none object-none m-auto cursor-zoom-out'
                                : 'max-w-full max-h-full object-contain cursor-zoom-in'
                        ]"
                        @click.stop="toggleSize"
                    />
                </div>

                <!-- Bottom Helper Bar -->
                <div
                    class="px-4 py-2 text-center text-[11px] sm:text-xs text-white/50 bg-black/30 border-t border-white/5 shrink-0"
                >
                    <span>Cliquez sur l'image pour basculer le zoom • Échap pour fermer</span>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
