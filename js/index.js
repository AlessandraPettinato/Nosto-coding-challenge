const checkTrailingZeros = (num) => {
	return num.includes(".00") ? num.split(".00")[0] : num;
};

const deleteEuroSign = (num) => {
	return num.includes("€") ? num.split("€")[1] : num;
};

const createTag = (tag, content, addClass) => {
	let tagName = document.createElement(tag);
	let tagContent = document.createTextNode(content);

	if (addClass === "slides-price") {
		content.includes("€")
			? (tagContent = document.createTextNode(checkTrailingZeros(content)))
			: (tagContent = document.createTextNode(
					"€" + checkTrailingZeros(content)
			  ));
	}

	tagName.appendChild(tagContent);
	tagName.classList.add(addClass);

	return tagName;
};

const createSlide = (imageUrl, name, brand, price, listPrice, addClass) => {
	let slide = document.createElement("div");
	let slideImage = document.createElement("img");
	slideImage.src = imageUrl;
	slideImage.classList.add(addClass);
	slide.appendChild(slideImage);

	let brandTag = createTag("p", brand, "slides-brand");

	let nameTag = createTag("p", name, "slides-name");

	let priceTag = createTag("p", price, "slides-price");

	slideImage.after(brandTag);
	brandTag.after(nameTag);
	nameTag.after(priceTag);

	if (addClass === "first-slide") {
		let mostViewedTag = createTag("p", "most viewed!", "most-viewed-caption");
		slideImage.before(mostViewedTag);
	}

	if (
		checkTrailingZeros(deleteEuroSign(price)) !==
		checkTrailingZeros(deleteEuroSign(listPrice))
	) {
		let tagPriceListName = createTag(
			"p",
			checkTrailingZeros(listPrice),
			"slides-price"
		);
		tagPriceListName.classList.add("strike-price");
		priceTag.setAttribute("id", "slides-bestPrice");
		priceTag.classList.remove("slides-price");

		let priceContainer = createTag("div", "", "price-container");

		priceContainer.appendChild(priceTag);
		priceContainer.appendChild(tagPriceListName);
		nameTag.after(priceContainer);
	}

	return slide;
};

const groupFileObj = (obj) => {
	let mostSold;
	let mostViewed;
	let carouselObj;

	for (let values of Object.values(obj)) {
		let groupedSoldValues = [];
		let groupedViewedValues = [];

		values.forEach((item) => {
			const { soldThisWeek, viewThisWeek, ...rest } = item;

			groupedSoldValues.push(soldThisWeek);
			groupedViewedValues.push(viewThisWeek);

			if (groupedSoldValues.reduce((a, b) => Math.max(a, b)) === soldThisWeek) {
				mostSold = {
					...rest,
					soldThisWeek,
					viewThisWeek,
				};
			}

			if (
				groupedViewedValues.reduce((a, b) => Math.max(a, b)) === viewThisWeek
			) {
				mostViewed = {
					...rest,
					soldThisWeek,
					viewThisWeek,
				};
			}
		});

		carouselObj = values
			.filter(
				(item) =>
					item.soldThisWeek !== mostSold.soldThisWeek &&
					item.viewThisWeek !== mostViewed.viewThisWeek
			)
			.sort((a, b) => b.viewThisWeek - a.viewThisWeek);
	}

	$(".best-seller-link").attr("href", `${mostSold.url}`),
		$(".best-seller-pic").attr({
			src: `${mostSold.imageUrl}/>`,
			alt: `${mostSold.name}`,
		});

	let firstSlide = createSlide(
		`${mostViewed.imageUrl}`,
		`${mostViewed.name}`,
		`${mostViewed.brand}`,
		`${mostViewed.price}`,
		`${mostViewed.listPrice}`,
		"first-slide"
	);

	document.getElementById("slides").appendChild(firstSlide);

	carouselObj.map((item) => {
		let newSlide = createSlide(
			`${item.imageUrl}`,
			`${item.name}`,
			`${item.brand}`,
			`${item.price}`,
			`${item.listPrice}`,
			"slides-pic"
		);

		document.getElementById("slides").appendChild(newSlide);
	});
};

$("document").ready(() => {
	$.ajax({
		method: "GET",
		url: "https://nosto-campaign-assets.s3.amazonaws.com/test-task/testtask-products.json",
		dataType: "json",
	})
		.done((file) => {
			groupFileObj(file);
			$("#slides").slick({
				infinite: true,
				slidesToShow: 3,
				slidesToScroll: 2,
				variableWidth: true,
				draggable: false,
				responsive: [
					{
						breakpoint: 955,
						settings: {
							slidesToShow: 2,
							slidesToScroll: 1,
							arrows: false,
							draggable: true,
						},
					},
				],
			});
		})
		.fail(() => {
			alert("error");
		});
});
