import { useCallback, useEffect, useMemo, useState } from 'react';

import type { PostPurchaseRenderApi } from '@shopify/post-purchase-ui-extensions-react';
import {
    BlockStack,
    Bookend,
    Button,
    CalloutBanner,
    Heading,
    Image,
    InlineStack,
    Layout,
    Select,
    Separator,
    Text,
    TextContainer,
    TextField,
    extend,
    render,
    useExtensionInput
} from '@shopify/post-purchase-ui-extensions-react';

import type { PostPurchaseFormState } from '@/types/components.type';
import type { AddVariantChange, CalculatedPurchase, PurchaseOption } from '@/types/offer.type';

import { PpComponents } from './components/PriceComponents';
import { formatCurrency } from './utils/formatters';

// For local development, replace APP_URL with your local tunnel URL.
const APP_URL = 'https://jurisdiction-spirits-massive-bay.trycloudflare.com';

// Preload data from your app server to ensure that the extension loads quickly.
extend('Checkout::PostPurchase::ShouldRender', async ({ inputData, storage }) => {
    console.log('<==inputData ==>', inputData);
    const postPurchaseFunnel = await fetch(`${APP_URL}/api/offer`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${inputData.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            referenceId: inputData.initialPurchase.referenceId
        })
    }).then((response) => response.json());

    console.log('postPurchaseFunnel==>', postPurchaseFunnel);

    await storage.update(postPurchaseFunnel);

    return { render: true };
});

render('Checkout::PostPurchase::Render', () => <App />);

export function App() {
    const { storage, inputData, calculateChangeset, applyChangeset, done } =
        useExtensionInput() as PostPurchaseRenderApi;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [calculatedPurchase, setCalculatedPurchase] = useState<CalculatedPurchase>();
    console.log('error :>> ', error);

    const { offer: purchaseOption } = storage.initialData as {
        offer: PurchaseOption;
    };

    const initialOptions = useMemo(
        () => ({
            quantity: purchaseOption.changes[0]?.quantity || 1,
            variantId: purchaseOption.variants[0].id || '',
            variantTitle: purchaseOption.variants[0].title,
            imageSrc:
                purchaseOption.productImage?.url || purchaseOption.variants[0].image?.url || '',
            altText:
                purchaseOption.productImage?.altText ||
                purchaseOption.variants[0].image?.altText ||
                '',
            maxQuantity: purchaseOption.variants[0].inventoryQuantity || undefined,
            mainTitle: purchaseOption.productTitle
        }),
        [purchaseOption]
    );

    const [options, setOptions] = useState<PostPurchaseFormState>(initialOptions);

    /**
     *   Function for changing the variant
     */
    const handleSelectChange = useCallback(
        (value: string) => {
            const targetedVariant = purchaseOption.variants.find((variant) => variant.id === value);

            if (!targetedVariant) return;

            const { id, title, image, displayName, inventoryQuantity } = targetedVariant;

            setOptions({
                ...options,
                variantId: id,
                variantTitle: title,
                imageSrc: image?.url || '',
                altText: image?.altText ?? '',
                mainTitle: displayName,
                maxQuantity: inventoryQuantity
            });
        },
        [options, purchaseOption.variants]
    );

    /**
     *  Slider actions for the images. It is necessary if there is more than one image option (few variants)
     */
    const isMoreThenOneImgOption = useMemo(() => {
        /**
         * Get the array of images for the slider.
         */
        const imageSetArray =
            purchaseOption.variants?.map(({ image }) => ({
                url: image?.url || '',
                altText: image?.altText || ''
            })) || [];

        /**
         * Check if the slider is necessary
         */
        const isNecessarySlider = imageSetArray.length > 1;

        /**
         * Get the index of the current image in the array
         */
        const currentImageIndex = imageSetArray.findIndex(({ url }) => url === options.imageSrc);

        /**
         * Change the image in the slider if the user clicks on the arrow buttons
         */
        const changeImage = (direction: number) => {
            const newIndex =
                (currentImageIndex + direction + imageSetArray.length) % imageSetArray.length;

            const { url: newImageSrc } = imageSetArray[newIndex];

            const variantId = purchaseOption.variants.find(
                ({ image }) => image?.url === newImageSrc
            )?.id;

            /**
             * Change form data if the user clicks on the arrow buttons
             */
            variantId && handleSelectChange(variantId);
        };

        const onNextImage = () => changeImage(1);
        const onPrevImage = () => changeImage(-1);

        /**
         * Change the image in the slider and variant data if the user clicks on the image
         */
        const onImageClick = (imageSrc: string) => {
            const variantId = purchaseOption.variants.find(
                ({ image }) => image?.url === imageSrc
            )?.id;
            variantId && handleSelectChange(variantId);
        };

        /**
         * Return necessary data for the slider manipulations
         */
        return {
            isNecessarySlider,
            onNextImage,
            onPrevImage,
            imageSetArray,
            onImageClick
        };
    }, [handleSelectChange, options.imageSrc, purchaseOption.variants]);

    /**
     * Calculate the purchase new price when some changes are made
     */
    useEffect(() => {
        async function calculatePurchase() {
            const result = await calculateChangeset({
                changes: [
                    {
                        ...purchaseOption.changes[0],
                        variantId: Number(options.variantId),
                        quantity: options.quantity
                    }
                ] as AddVariantChange[]
            });

            setCalculatedPurchase(result.calculatedPurchase);
        }

        calculatePurchase().then(() => {
            setLoading(false);
        });
    }, [calculateChangeset, purchaseOption.changes, options]);

    /**
     * Get the payments data for the post-purchase form
     */
    const payments = useMemo(() => {
        const shipping =
            Number(calculatedPurchase?.addedShippingLines[0]?.priceSet?.presentmentMoney?.amount) ||
            0;
        const taxes =
            Number(calculatedPurchase?.addedTaxLines[0]?.priceSet?.presentmentMoney?.amount) || 0;
        const total = Number(calculatedPurchase?.totalOutstandingSet.presentmentMoney.amount);
        const discountedPrice =
            Number(calculatedPurchase?.updatedLineItems[0].totalPriceSet.presentmentMoney.amount) ||
            0;
        const originalPrice =
            Number(calculatedPurchase?.updatedLineItems[0].priceSet.presentmentMoney.amount) *
                options.quantity || 0;

        return {
            shipping,
            taxes,
            total,
            discountedPrice,
            originalPrice
        };
    }, [calculatedPurchase, options.quantity]);

    /**
     * Accept the order and apply the changeset
     */
    const handleApiError = useCallback((error: Error) => {
        setError(error.message);
        setLoading(false);
    }, []);

    const acceptOrder = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Make a request to your app server to sign the changeset with your app's API secret key.
            const token = await fetch(`${APP_URL}/api/sign-changeset`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${inputData.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sub: inputData.initialPurchase.referenceId,
                    changes: [
                        {
                            ...purchaseOption.changes[0],
                            variantId: options.variantId,
                            quantity: options.quantity
                        }
                    ]
                })
            })
                .then((response) => response.json())
                .then((response) => response.token)
                .catch((e) => console.log(e));

            /**
             * Apply the changeset
             */
            await applyChangeset(token);

            /**
             * Update the statistic for analytics block on the dashboard
             */
            await fetch(`${APP_URL}/api/statistic-update`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${inputData.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    funnelId: purchaseOption.id,
                    revenue: Number(payments.total),
                    discount: parseFloat((payments.originalPrice - payments.total).toFixed(2))
                })
            }).then((response) => response.json());

            // Redirect to the thank-you page
            await done();
        } catch (err) {
            handleApiError(err as Error);
        }
    }, [options, payments, purchaseOption, inputData]);

    /**
     * Decline the order
     */
    async function declineOrder() {
        setLoading(true);
        // Redirect to the thank-you page
        await done();
    }

    const handleQuantityChange = (value: string) => {
        setOptions({ ...options, quantity: Number(value) });
    };

    return (
        <BlockStack spacing='loose'>
            <CalloutBanner border='none' spacing='loose'>
                <BlockStack spacing='loose'>
                    <TextContainer>
                        <Text size='xlarge' emphasized>
                            {`We have offer for you with ${purchaseOption.discount}% discount`}
                        </Text>
                    </TextContainer>
                </BlockStack>
            </CalloutBanner>
            <Layout
                media={[
                    { viewportSize: 'small', sizes: [1, 0, 1], maxInlineSize: 0.9 },
                    { viewportSize: 'medium', sizes: [532, 0, 1], maxInlineSize: 420 },
                    { viewportSize: 'large', sizes: [560, 38, 340] }
                ]}>
                <BlockStack>
                    <Image description='product photo' source={options.imageSrc} />
                    {isMoreThenOneImgOption.isNecessarySlider && (
                        <InlineStack>
                            <Button onPress={isMoreThenOneImgOption.onPrevImage} plain>
                                ⟨
                            </Button>
                            {isMoreThenOneImgOption.imageSetArray.map((image) => (
                                <Button
                                    onPress={() => isMoreThenOneImgOption.onImageClick(image.url)}
                                    plain
                                    key={image.url}>
                                    <Image
                                        description={image.altText || 'product photo'}
                                        source={image.url}
                                        bordered={options.imageSrc === image.url}
                                    />
                                </Button>
                            ))}
                            <Button onPress={isMoreThenOneImgOption.onNextImage} plain>
                                ⟩
                            </Button>
                        </InlineStack>
                    )}
                </BlockStack>
                <BlockStack />
                <BlockStack>
                    <Heading level={2}>{options.mainTitle}</Heading>
                    <PpComponents.PriceHeader
                        discountedPrice={payments.discountedPrice}
                        originalPrice={payments.originalPrice}
                        loading={!calculatedPurchase}
                    />
                    <Bookend leading alignment='leading' spacing='tight'>
                        <TextField
                            label='Quantity'
                            type='number'
                            value={options.quantity.toString()}
                            onInput={handleQuantityChange}
                            tooltip={{
                                label: 'Quantity',
                                content: `You can
                purchase up to ${options.maxQuantity} of this item.`
                            }}
                            error={
                                options.maxQuantity
                                    ? options.quantity > options.maxQuantity
                                        ? 'Quantity exceeds available stock'
                                        : options.quantity < 1
                                          ? 'Quantity must be at least 1'
                                          : undefined
                                    : undefined
                            }
                        />
                        <Select
                            label='Variant'
                            value={options.variantId}
                            onChange={handleSelectChange}
                            options={purchaseOption.variants.map((variant) => ({
                                value: variant.id,
                                label: variant.title
                            }))}
                        />
                    </Bookend>
                    <BlockStack spacing='tight'>
                        <Separator />
                        <PpComponents.MoneyLine
                            label='Subtotal'
                            amount={payments.discountedPrice}
                            loading={!calculatedPurchase}
                        />
                        <PpComponents.MoneyLine
                            label='Shipping'
                            amount={payments.shipping}
                            loading={!calculatedPurchase}
                        />
                        <PpComponents.MoneyLine
                            label='Taxes'
                            amount={payments.taxes}
                            loading={!calculatedPurchase}
                        />
                        <Separator />
                        <PpComponents.MoneySummary label='Total' amount={payments.total} />
                    </BlockStack>
                    <BlockStack>
                        <Button onPress={acceptOrder} submit loading={loading}>
                            Pay now · {formatCurrency(payments.total)}
                        </Button>
                        <Button onPress={declineOrder} subdued loading={loading}>
                            Decline this offer
                        </Button>
                    </BlockStack>
                </BlockStack>
            </Layout>
        </BlockStack>
    );
}
