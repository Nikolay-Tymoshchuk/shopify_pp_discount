import { useCallback, useEffect, useState } from 'react';

import {
    useActionData,
    useLoaderData,
    useNavigate,
    useNavigation,
    useSubmit
} from '@remix-run/react';

import {
    BlockStack,
    Card,
    Divider,
    FormLayout,
    Grid,
    Layout,
    Page,
    PageActions,
    Text,
    TextField
} from '@shopify/polaris';

import { funnelAction, funnelLoader } from '@/app/actions/funnelActions';
import { ProductCard } from '@/app/components/ProductCard';
import { FunnelActions } from '@/types/funnels.type';

import dictionary from '~/dictionary/en.json';

export { funnelAction as action, funnelLoader as loader };

const FunnelPage = () => {
    const loaderData = useLoaderData<typeof funnelLoader>();
    const [formState, setFormState] = useState(loaderData.data.funnel);
    const [cleanFormState, setCleanFormState] = useState(loaderData.data.funnel);
    const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);
    const errors = useActionData<typeof funnelAction>()?.errors || {};

    useEffect(() => {
        const { funnel } = loaderData.data;
        setFormState(funnel);
        setCleanFormState(funnel);
    }, [loaderData]);

    const handleInputChange = (field: string, value: any) => {
        setFormState((prevState) => ({ ...prevState, [field]: value }));
    };

    const navigate = useNavigate();
    const nav = useNavigation();
    const isLoading = nav.state === 'submitting';

    async function selectProduct(idOfButton: 'offer-product' | 'trigger-product') {
        const isOfferProduct = idOfButton === 'offer-product';
        const products = await window.shopify.resourcePicker({
            type: 'product',
            action: 'select',
            multiple: false,
            filter: {
                query: isOfferProduct
                    ? ''
                    : `NOT id:${loaderData.data.triggeredIds.join(' AND NOT id:')}`
            }
        });

        if (products) {
            const { id, title } = products[0];
            console.log('Selected Product ID:', id);
            console.log('Selected Product Title:', title);
            handleInputChange(isOfferProduct ? 'offerId' : 'triggerId', id);
            handleInputChange(isOfferProduct ? 'offerName' : 'triggerName', title);
        }
    }

    function clearProductData(id: 'offer-product' | 'trigger-product') {
        const isOfferProduct = id === 'offer-product';
        handleInputChange(isOfferProduct ? 'offerId' : 'triggerId', '');
        handleInputChange(isOfferProduct ? 'offerName' : 'triggerName', '');
    }

    const handleCancel = useCallback(() => {
        setFormState(cleanFormState);
    }, [cleanFormState]);

    const submit = useSubmit();

    function handleSave() {
        const data = {
            name: formState.name,
            triggerId: formState.triggerId || '',
            offerId: formState.offerId || '',
            discount: formState.discount || 0,
            action: formState.id ? FunnelActions.UPDATE_FUNNEL : FunnelActions.CREATE_FUNNEL
        };

        setCleanFormState({ ...formState });
        submit(data, { method: formState.id ? 'put' : 'post' });
    }

    return (
        <Page
            title={
                loaderData.data.funnel.id ? dictionary.editFunnel : dictionary.createFunnelTitle
            }>
            <Layout>
                <Layout.Section>
                    <FormLayout>
                        <BlockStack gap='1000'>
                            <Divider borderColor='border' borderWidth='025' />
                            <Grid
                                columns={{ xs: 1, sm: 1, md: 5, lg: 5, xl: 5 }}
                                gap={{
                                    xs: '16px',
                                    sm: '16px',
                                    md: '40px',
                                    lg: '40px',
                                    xl: '40px'
                                }}>
                                <Grid.Cell columnSpan={{ md: 2, lg: 2, xl: 2 }}>
                                    <BlockStack gap='200'>
                                        <Text as='h2' fontWeight='medium' variant='headingLg'>
                                            {dictionary.name}
                                        </Text>
                                        <Text as='p' variant='bodyMd'>
                                            {dictionary.funnelNameDescription}
                                        </Text>
                                    </BlockStack>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ md: 3, lg: 3, xl: 3 }}>
                                    <Card>
                                        <TextField
                                            label={dictionary.funnelName}
                                            value={formState.name}
                                            onChange={(value) => handleInputChange('name', value)}
                                            autoComplete='off'
                                            error={errors.title}
                                        />
                                    </Card>
                                </Grid.Cell>
                                <ProductCard
                                    label='trigger'
                                    description='triggerDescription'
                                    productId={formState.triggerId}
                                    productName={formState.triggerName}
                                    onSelect={() => selectProduct('trigger-product')}
                                    id='trigger-product'
                                    onClear={() => clearProductData('trigger-product')}
                                    error={errors.triggerProductId}
                                />
                                <ProductCard
                                    label='offer'
                                    description='offerDescription'
                                    productId={formState.offerId}
                                    productName={formState.offerName}
                                    id='offer-product'
                                    onSelect={() => selectProduct('offer-product')}
                                    onClear={() => clearProductData('offer-product')}
                                    error={errors.offerProductId}
                                />
                                <Grid.Cell columnSpan={{ md: 2, lg: 2, xl: 2 }}>
                                    <BlockStack gap='200'>
                                        <Text as='h2' fontWeight='medium' variant='headingLg'>
                                            {dictionary.discount}
                                        </Text>
                                        <Text as='p' variant='bodyMd'>
                                            {dictionary.discountDescription}
                                        </Text>
                                    </BlockStack>
                                </Grid.Cell>
                                <Grid.Cell columnSpan={{ md: 3, lg: 3, xl: 3 }}>
                                    <Card>
                                        <TextField
                                            label={dictionary.selectYourDiscount}
                                            type='number'
                                            value={formState.discount.toString()}
                                            onChange={(value) =>
                                                handleInputChange('discount', Number(value))
                                            }
                                            autoComplete='off'
                                            min={0}
                                            max={100}
                                            autoSize
                                            suffix='%'
                                            align='left'
                                        />
                                    </Card>
                                </Grid.Cell>
                            </Grid>
                            <Divider borderColor='border' borderWidth='025' />
                        </BlockStack>
                    </FormLayout>
                </Layout.Section>
                <Layout.Section>
                    <PageActions
                        primaryAction={{
                            content: dictionary.save,
                            loading: isLoading,
                            disabled: !isDirty || isLoading,
                            onAction: handleSave
                        }}
                        secondaryActions={
                            loaderData.data?.funnel?.id
                                ? [
                                      {
                                          content: dictionary.createNewFunnel,
                                          loading: isLoading,
                                          disabled: isLoading,
                                          onAction: () => navigate('/app/funnels/new')
                                      },
                                      {
                                          content: dictionary.cancel,
                                          loading: isLoading,
                                          disabled: !isDirty,
                                          onAction: handleCancel
                                      }
                                  ]
                                : undefined
                        }
                    />
                </Layout.Section>
            </Layout>
        </Page>
    );
};

export default FunnelPage;
