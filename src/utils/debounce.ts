export function debounce<T extends (arg: string) => void>(fn: T, delay: number) {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const debounced = (arg: string) => {
        if (arg.length === 1) {
            if (timer) clearTimeout(timer);
            fn(arg);
            return;
        }

        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn(arg), delay);
    };

    debounced.cancel = () => {
        if (timer) clearTimeout(timer);
        timer = null;
    };

    return debounced;
}
