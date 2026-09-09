<script setup lang="ts">
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogDescription, DialogTitle } from '../ui/dialog';
import { useUserStore } from '@/utils/store';
import { UserCheck } from 'lucide-vue-next';

const props = defineProps<{ open: boolean; onClose: () => void; listOwner: string }>()

const store = useUserStore()

function onValidate() {
    store.setUsername(props.listOwner)
    props.onClose()
}

</script>

<template>
    <Dialog :open="props.open" @update:open="props.onClose">
        <DialogContent class="sm:max-w-[425px] rounded-2xl p-6">
            <DialogHeader class="text-left space-y-2">
                <div class="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-1">
                    <UserCheck class="w-6 h-6" />
                </div>
                <DialogTitle class="text-xl font-bold">
                    Êtes-vous {{ props.listOwner }} ?
                </DialogTitle>
                <DialogDescription class="text-sm text-muted-foreground leading-relaxed">
                    Vous pourrez ajouter des idées cadeaux, modifier ou supprimer des souhaits de cette liste.
                </DialogDescription>
            </DialogHeader>

            <DialogFooter class="flex-col-reverse sm:flex-row gap-2 mt-4">
                <Button variant="outline" class="rounded-xl h-11" @click="onClose">
                    Non, je suis un invité
                </Button>
                <Button class="rounded-xl h-11 font-semibold shadow-sm" @click="onValidate">
                    Oui, c'est ma liste !
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>