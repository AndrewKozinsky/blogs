export type ItemsOutModel<T> = {
	// Общее количество страниц элементов
	pagesCount: number
	// Номер текущей страницы с выводом элементов
	page: number
	// Сколько элементов на странице
	pageSize: number
	// Общее количество элементов
	totalCount: number
	// Элементы на указанной странице
	items: T[]
}
