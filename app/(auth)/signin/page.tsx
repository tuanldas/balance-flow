'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {zodResolver} from '@hookform/resolvers/zod';
import {AlertCircle, Eye, EyeOff, LoaderCircleIcon} from 'lucide-react';
import {useForm} from 'react-hook-form';
import {useAuth} from '@/providers/auth-provider';
import {Alert, AlertIcon, AlertTitle} from '@/components/ui/alert';
import {Button} from '@/components/ui/button';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {getSigninSchema, SigninSchemaType} from '../forms/signin-schema';

export default function Page() {
    const router = useRouter();
    const auth = useAuth();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<SigninSchemaType>({
        resolver: zodResolver(getSigninSchema()),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(values: SigninSchemaType) {
        setIsProcessing(true);
        setError(null);

        try {
            await auth.signIn({email: values.email, password: values.password});
            router.push('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="block w-full space-y-5">
                <div className="space-y-1.5 pb-3">
                    <h1 className="text-2xl font-semibold tracking-tight text-center">Sign in to Metronic</h1>
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertIcon>
                            <AlertCircle/>
                        </AlertIcon>
                        <AlertTitle>{error}</AlertTitle>
                    </Alert>
                )}

                <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Your email" {...field} />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <div className="relative">
                                <Input
                                    placeholder="Your password"
                                    type={passwordVisible ? 'text' : 'password'}
                                    {...field}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    mode="icon"
                                    size="sm"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                    className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5 bg-transparent!"
                                    aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                                >
                                    {passwordVisible ? (
                                        <EyeOff className="text-muted-foreground"/>
                                    ) : (
                                        <Eye className="text-muted-foreground"/>
                                    )}
                                </Button>
                            </div>
                            <FormMessage/>
                        </FormItem>
                    )}
                />


                <div className="flex flex-col gap-2.5">
                    <Button type="submit" disabled={isProcessing}>
                        {isProcessing ? <LoaderCircleIcon className="size-4 animate-spin"/> : null}
                        Continue
                    </Button>
                </div>


            </form>
        </Form>
    );
}
