<script setup lang="ts">
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogDescription, DialogTitle } from '../ui/dialog';
import { useUserStore } from '@/utils/store';

const props = defineProps<{ open: boolean; onClose: () => void; listOwner: string }>()

const store = useUserStore()

function onValidate() {
    store.setUsername(props.listOwner)
    props.onClose()
}

</script>

<template>
    <Dialog :open="props.open" @update:open="props.onClose">
        <DialogContent hide-close>
            <DialogHeader>
                <DialogTitle>
                    C'est votre liste ?
                </DialogTitle>
            </DialogHeader>
            <p>Voulez-vous vous connecter en tant que <b>{{ props.listOwner }}</b> afin de pouvoir modifier cette liste ?</p>
            <DialogFooter class="gap-2">
                <Button variant="secondary" @click="onClose">
                    Annuler
                </Button>
                <Button @click="onValidate">
                    Oui
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>